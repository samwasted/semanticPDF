import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";

enum UserStatus {
  ACTIVE = "ACTIVE",
  UNVERIFIED = "UNVERIFIED",
  INACTIVE = "INACTIVE",
  CANCELLED = "CANCELLED",
  PAST_USER = "PAST_USER",
}

export async function POST(request: Request) {
  try {
    const { subscriptionId, paymentId, signature } = await request.json();

    if (!subscriptionId || !paymentId || !signature) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_SECRET_ID;
    if (!secret) {
      console.error("RAZORPAY_SECRET_ID not set in environment");
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    // Signature verification
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ message: "Signature verification failed" }, { status: 400 });
    }

    // Razorpay client
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });

    const subscription = await razorpay.subscriptions.fetch(subscriptionId);

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentEndDate = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : null;

    let status = UserStatus.INACTIVE;
    if (!currentEndDate && subscriptionId) {
      status = UserStatus.UNVERIFIED;
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        SubscriptionId: subscriptionId,
        PriceId: subscription.plan_id,
        CurrentPeriodEnd: currentEndDate,
        status,
        remainingCount: Number(subscription.remaining_count) || 0,
        short_url: subscription.short_url || null,
      },
    });

    return NextResponse.json({
      message: "Subscription updated",
      success: true,
      currentPeriodEnd: currentEndDate,
      status,
    });
  } catch (err) {
    console.error("verifySubscription error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
