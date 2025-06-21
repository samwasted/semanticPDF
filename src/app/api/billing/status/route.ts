// app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getUserSubscriptionPlanRazorpay } from "@/lib/razorpay"
import Razorpay from "razorpay";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

enum UserStatus {
  ACTIVE = "ACTIVE",
  UNVERIFIED = "UNVERIFIED",
  INACTIVE = "INACTIVE",
  CANCELLED = 'CANCELLED',
  PAST_USER = 'PAST_USER'
}

export async function GET() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const dbUser = await db.user.findFirst({
    where: { id: user?.id },
  });
  const razorpayInstance = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_SECRET_ID as string,
  });
  const subscriptionId = dbUser?.SubscriptionId as string;
  const subscription = await razorpayInstance.subscriptions.fetch(subscriptionId);

  console.log(subscription)
  if(subscription.short_url != dbUser?.short_url) {
    await db.user.update({
      where: { id: dbUser?.id },
      data: {
        short_url: subscription.short_url,
      },
    });
  }
  if (subscription.current_end != null) {

    if (subscription.current_end < Math.floor(Date.now() / 1000)) {
      //if the subscription is expired, update the user status to inactive
      await db.user.update({
        where: { id: dbUser?.id },
        data: {
          status: UserStatus.INACTIVE,
          remainingCount: 0,
          CurrentPeriodEnd: null,
          SubscriptionId: null,
        },
      });
    } else {
      //make call to db to update the end time and status to active from unverified
      // but also need to ensure if db is already updated
      // if not then update the db with the current_end time and status
      const currentEndDate = new Date(subscription.current_end * 1000);
      let status = UserStatus.UNVERIFIED;
      if (currentEndDate !== null && subscriptionId !== null) status = UserStatus.ACTIVE;
      if (!user || !user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      if (dbUser?.status === UserStatus.CANCELLED && dbUser?.remainingCount === 0) {
        //do nothing
      } else if (dbUser?.status === UserStatus.UNVERIFIED) {
        await db.user.update({
          where: { id: user.id },
          data: {
            status: status,
            remainingCount: Number(subscription.remaining_count) ?? 0,
            CurrentPeriodEnd: currentEndDate,
            SubscriptionId: subscription.id,
          },
        })
      }
    }
    const plan = await getUserSubscriptionPlanRazorpay();
    return NextResponse.json(plan);

  }
}