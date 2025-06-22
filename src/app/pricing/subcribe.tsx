'use client'
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Script from "next/script";
import { toast } from "sonner";

export default function SubscriptionButton() {

  const subscribe = async () => {
    try {
      // 1. Create subscription
      const res = await fetch("/api/createSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to create subscription");
      const { subscription_id } = await res.json();

      // 2. Open Razorpay Checkout for subscription authorization
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id,
        name: "semanticPDF",
        currency: "INR",
        description: "Monthly Subscription",
        handler: async (response: any) => {
          // 3. Verify subscription payment
          try {
            const verifyRes = await fetch("/api/verifySubscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: response.razorpay_subscription_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              })
            });
            if (!verifyRes.ok) throw new Error("Verification API error");
            const result = await verifyRes.json();
            console.log(result)
            if (result.success) {
              return toast.success("You have upgraded successfully! reload page to see changes")                  //update to use sonner / toast
            } else {
              return toast.error("Subscription error", {
              style: {
                background: '#4832a8',
                color: 'white',
              },
            })
            }
          } catch (err: any) {
            console.error(err);
            return toast.error("Subscrption failed", {
              style: {
                background: '#cc7872',
                color: 'white',
              },
            })
          }
        },
        // Optional: handle checkout dismiss or failure
        modal: {
          ondismiss: () => toast.error("Subscription popup closed", {
              style: {
                background: '#cc7872',
                color: 'white',
              },
            })
        },
        // prefill: {
        // Uncomment and populate if you have user data
        // name: "Customer Name",
        // email: "customer@example.com",
        // contact: "+919876543210"
        // }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert("Could not initiate subscription. Please try later.");
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Button onClick={subscribe} className="w-full cursor-pointer">
        Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
      </Button>
    </>
  );
}
