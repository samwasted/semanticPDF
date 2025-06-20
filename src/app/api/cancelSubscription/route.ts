import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

export async function POST(request: Request) {
  const { subscriptionId, cancelAtCycleEnd } = await request.json();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Pass cancelAtCycleEnd as boolean directly
    const canceledSub = await razorpay.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd as boolean
    );
    // Immediate cancellation: clear fields
    if (cancelAtCycleEnd === false) {
      await db.user.update({
        where: { id: user.id },
        data: {
          SubscriptionId: null,
          PriceId: null,
          CurrentPeriodEnd: null,
          CustomerId: null,
        },
      });
    }
    return NextResponse.json({
      message: "Subscription cancelled",
      status: canceledSub.status,
    });
  } catch (error: any) {
    const msg = error.error?.description || error.message;
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}
