import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

export async function POST(request: Request) {
  const { subscriptionId, cancelAtCycleEnd } = await request.json();

  // Authenticate user (optional, but recommended)
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cancel the subscription
    const cancelled = await razorpay.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd
    );

    if (!cancelled) {
      return NextResponse.json(
        { message: "Cancellation failed" },
        { status: 400 }
      );
    }
    // Update user record in the database
    await db.user.update({
      where: { id: user.id },
      data: {
        status: "CANCELLED",
        remainingCount: 0, // Reset remaining count
      },
    });
    // Return success response
    if (cancelAtCycleEnd) {
      return NextResponse.json({
        message: "Subscription will be cancelled at the end of the cycle",
      });
    }

    return NextResponse.json({
      message: "Subscription cancelled",
      status: cancelled.status,
      cancelledAt: cancelled.ended_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Cancellation failed" },
      { status: 400 }
    );
  }
}
