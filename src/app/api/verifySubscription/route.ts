import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";

export async function POST(request: Request) {
  const { subscriptionId, paymentId, signature } = await request.json();

  // 1. Verify Razorpay signature
  const secret = process.env.RAZORPAY_SECRET_ID!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(paymentId + "|" + subscriptionId)
    .digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ message: "Verification failed" }, { status: 400 });
  }

  // 2. Initialize Razorpay client & fetch subscription details
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET_ID!,
  });
  let subscription;
  try {
    subscription = await razorpay.subscriptions.fetch(subscriptionId);
  } catch (err) {
    console.error("Fetch subscription error:", err);
    return NextResponse.json({ message: "Subscription fetch failed" }, { status: 500 });
  }

  // 3. Get authenticated user session
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 4. Extract `current_end` and `customer_id`
  const currentEndDate = subscription.current_end
    ? new Date(subscription.current_end * 1000)
    : null;
  const customerId = subscription.customer_id ?? null;

  // 5. Update Prisma user record
  await db.user.update({
    where: { id: user.id },
    data: {
      SubscriptionId: subscriptionId,
      CustomerId: customerId,
      PriceId: subscription.plan_id,
      CurrentPeriodEnd: currentEndDate,
    },
  });

  return NextResponse.json({
    message: "Subscription updated",
    success: true,
    currentPeriodEnd: currentEndDate,
    customerId,
  });
}
