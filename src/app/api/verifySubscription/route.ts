import { NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(subscriptionId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_SECRET_ID!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(paymentId + "|" + subscriptionId)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  const { subscriptionId, paymentId, signature } = await request.json();
  if (!verifySignature(subscriptionId, paymentId, signature)) {
    return NextResponse.json({ message: "Verification failed", success: false }, { status: 400 });
  }
  // Update DB: grant subscription access to user
  return NextResponse.json({ message: "Subscription verified", success: true });
}
