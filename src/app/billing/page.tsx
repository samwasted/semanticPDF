'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getUserSubscriptionPlanRazorpay } from '@/lib/razorpay'; // Adjust import as needed
import dayjs from 'dayjs';

type BillingStatus = {
  name: string;
  slug: string;
  quota: number;
  pagesPerPdf: number;
  price: {
    amount: number;
    priceIds: { test: string; production: string };
  };
  razorpaySubscriptionId?: string;
  razorpayCurrentPeriodEnd?: Date | null;
  razorpayCustomerId?: string;
  isSubscribed: boolean;
  isCancelled: boolean;
  isScheduledToCancel?: boolean;
};

export default function BillingStatusPage() {
  const [plan, setPlan] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch billing status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/billing/status');
        const data = await res.json();
        setPlan(data);
      } catch (err) {
        setError('Could not load billing info.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cancel subscription handler
  const handleCancel = async () => {
    if (!plan?.razorpaySubscriptionId) return;
    setCancelLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cancelSubscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: plan.razorpaySubscriptionId,
          cancelAtCycleEnd: true, // Set to false for immediate cancel
        }),
      });
      if (!res.ok) throw new Error('Failed to cancel subscription');
      const updated = await res.json();
      setPlan((prev) => prev && { ...prev, isScheduledToCancel: true });
    } catch (err) {
      setError('Cancellation failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <div>Loading billing status...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!plan) return <div>No billing info found.</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 border rounded-lg p-6 bg-white shadow">
      <h2 className="text-2xl font-bold mb-2">Billing Status</h2>
      <div className="mb-4">
        <div>
          <span className="font-semibold">Plan:</span> {plan.name}
        </div>
        <div>
          <span className="font-semibold">Quota:</span> {plan.quota}
        </div>
        <div>
          <span className="font-semibold">Pages per PDF:</span> {plan.pagesPerPdf}
        </div>
        <div>
          <span className="font-semibold">Status:</span>{' '}
          {plan.isSubscribed ? (
            plan.isCancelled || plan.isScheduledToCancel ? (
              <span className="text-orange-500">Cancelling at period end</span>
            ) : (
              <span className="text-green-600">Active</span>
            )
          ) : (
            <span className="text-gray-500">Not Subscribed</span>
          )}
        </div>
        {plan.razorpayCurrentPeriodEnd && (
          <div>
            <span className="font-semibold">
              {plan.isCancelled || plan.isScheduledToCancel
                ? 'Access until'
                : 'Renews on'}
              :
            </span>{' '}
            {dayjs(plan.razorpayCurrentPeriodEnd).format('MMM D, YYYY')}
          </div>
        )}
      </div>
      {plan.isSubscribed && !(plan.isCancelled || plan.isScheduledToCancel) && (
        <Button
          onClick={handleCancel}
          disabled={cancelLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
        </Button>
      )}
      {(plan.isCancelled || plan.isScheduledToCancel) && (
        <div className="text-orange-500 mt-2">
          Your subscription will end at the end of the current billing period.
        </div>
      )}
    </div>
  );
}
