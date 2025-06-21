import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Razorpay from "razorpay";

// Initialize Razorpay client with secret key from env
export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    key_secret: process.env.RAZORPAY_SECRET_ID ?? "",
});
// Example: const PLANS = [{ id: "plan_123", name: "Pro", amount: 5000 }];
import { PLANS } from "../config/plan";
export async function getUserSubscriptionPlanRazorpay() {
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

  const isSubscribed = Boolean(
    dbUser.SubscriptionId
    && dbUser.PriceId
  );
  const status = dbUser.status || "INACTIVE"; // Default to INACTIVE if not set
const currentPeriodEnd = dbUser.CurrentPeriodEnd ? new Date(dbUser.CurrentPeriodEnd) : null; // Date object
const remainingCount = dbUser.remainingCount ?? 0;          // Number of months, default to 0 if null

const totalDays = 30 * remainingCount;
const newPeriodEnd = currentPeriodEnd
  ? new Date(currentPeriodEnd.getTime() + totalDays * 24 * 60 * 60 * 1000)
  : null;

  // Match plan using correct field
  const plan = isSubscribed
    ? PLANS.find((p) => 
        p.price.priceIds.test === dbUser.PriceId ||
        p.price.priceIds.production === dbUser.PriceId
      )
    : null;

  // Fetch live status with proper field access
  

  return {
    ...plan,
    razorpaySubscriptionId: dbUser.SubscriptionId,
    currentPeriodEnd: dbUser.CurrentPeriodEnd,
    razorpayCustomerId: dbUser.CustomerId,
    isSubscribed,
    endingAt: newPeriodEnd || null,
    status: status,
  };
}
