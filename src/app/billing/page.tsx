'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { stat } from 'fs';

type BillingStatus = {
  name: string;
  isSubscribed: boolean;
  isScheduledToCancel: boolean;
  razorpaySubscriptionId?: string;
  currentPeriodEnd?: string | null;
  endingAt?: string | null;
  status: UserStatus;
};
enum UserStatus {
  ACTIVE,
  INACTIVE,
  CANCELLED,
  UNVERIFIED
}

export default function BillingStatusPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/billing/status');
        if (!res.ok) throw new Error('Failed to load');
        setPlan(await res.json());
      } catch {
        setError('Could not load billing info');
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    if (!loading && (!plan || !plan.razorpaySubscriptionId)) {
      router.replace('/pricing?origin=billing');
    }
  }, [loading, plan, router]);

  const handleCancel = async () => {
    if (!plan?.razorpaySubscriptionId) return;
    setError(null);
    setCancelLoading(true);
    try {
      const res = await fetch('/api/cancelSubscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: plan.razorpaySubscriptionId,
          cancelAtCycleEnd: true,
        }),
      });
      if (!res.ok) throw new Error('Cancel failed');
      setPlan(prev => prev && { ...prev, isScheduledToCancel: true });
    } catch {
      setError('Cancellation failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <div>Loading billing status...</div>; //IMPROVE THIS
  if (error) return <div className="text-red-500">{error}</div>;
  if (!plan) return null;

  const { name, isSubscribed, currentPeriodEnd, endingAt, status } = plan;
  const renewDate = dayjs(currentPeriodEnd).format('MMM D, YYYY');
  const endDate  = dayjs(endingAt).format('MMM D, YYYY');

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Billing Status</h2>
      <div className="space-y-2 mb-6">
        <div><strong>Plan:</strong> {name}</div>
        <div>
          <strong>Status:</strong>{' '}
          {status}
        </div>
        {renewDate && <div><strong>'Renews on':</strong> {renewDate}</div>}
        {endDate && <div><strong>Ending at:</strong> {endDate}</div>}
      </div>
      {isSubscribed && (
        <Button onClick={handleCancel} disabled={cancelLoading} className="bg-red-600 hover:bg-red-700">
          {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
        </Button>
      )}
      {1 && <div className="mt-4 text-orange-600">Your subscription will end at the end of the current billing period.</div>}
    </div>
  );
}
