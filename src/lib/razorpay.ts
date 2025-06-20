import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Razorpay from "razorpay";

// Initialize Razorpay client with secret key from env
export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    key_secret: process.env.RAZORPAY_SECRET_ID ?? "",
});

// Define your plan mapping similar to PLANS in Stripe config
// Example: const PLANS = [{ id: "plan_123", name: "Pro", amount: 5000 }];
import { PLANS } from "../config/plan";

export async function getUserSubscriptionPlanRazorpay() {
    // 1. Authenticate user via Kinde
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user?.id) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            razorpayCurrentPeriodEnd: null,
        };
    }

    // 2. Fetch user record from Prisma
    const dbUser = await db.user.findUnique({
        where: { id: user.id },
    });
    if (!dbUser) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            razorpayCurrentPeriodEnd: null,
        };
    }

    // 3. Determine subscription validity
    const endDate = dbUser.CurrentPeriodEnd;
    const isSubscribed = Boolean(
        dbUser.SubscriptionId &&
        endDate &&
        endDate.getTime() > Date.now()
    );

    // 4. Match stored plan details
    const plan = isSubscribed
        ? PLANS.find((p) => p.price.priceIds.test === dbUser.PriceId)
        : null;

    // 5. Fetch live subscription status if active
    let isCanceled = false;
    let isScheduledToCancel
    let endAt = 0
    if (isSubscribed && dbUser.SubscriptionId) {
        const liveSub = await razorpay.subscriptions.fetch(dbUser.SubscriptionId);
        isCanceled = liveSub.status === 'cancelled';
        isScheduledToCancel =
            liveSub.status === "active" &&
            Number(liveSub.remaining_count) === 0 &&
            typeof liveSub.end_at === "number" &&
            liveSub.end_at > Date.now() / 1000;
        endAt = liveSub.end_at;
    }

    // 6. Return combined subscription info
    return {
        ...plan,
        razorpaySubscriptionId: dbUser.SubscriptionId,
        razorpayCurrentPeriodEnd: dbUser.CurrentPeriodEnd,
        razorpayCustomerId: dbUser.CustomerId,
        isSubscribed,
        isCanceled,
        isScheduledToCancel,
        endAt
    };
}
