// app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getUserSubscriptionPlanRazorpay } from "@/lib/razorpay"

export async function GET() {
  const plan = await getUserSubscriptionPlanRazorpay();
  return NextResponse.json(plan);
}
[]