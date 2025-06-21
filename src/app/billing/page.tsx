'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Divide, Gem, Loader2, User } from 'lucide-react';
import Link from 'next/link';

type BillingStatus = {
  name: string;
  isSubscribed: boolean;
  isScheduledToCancel: boolean;
  razorpaySubscriptionId?: string;
  currentPeriodEnd?: string | null;
  endingAt?: string | null;
  status: UserStatus;
  short_url: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      setIsDialogOpen(false); // Close dialog after successful cancellation
      window.location.reload();
    } catch {
      setError('Cancellation failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className='flex justify-center items-center h-[calc(100vh-70px)]'>
          <MaxWidthWrapper className='flex justify-center items-center flex-col'>
            <Loader2 className='w-5 h-5 animate-spin mb-6' />
            <p className='text-zinc-600'>Fetching payment details...</p>
          </MaxWidthWrapper>
        </div>
      </>
    );
  }
  
  if (error) return <div className="text-red-500">{error}</div>;
  if (!plan) return null;

  const { currentPeriodEnd, endingAt, status } = plan;
  const renewDate = dayjs(currentPeriodEnd).format('MMM D, YYYY');
  const endDate = dayjs(endingAt).format('MMM D, YYYY');

  return (
    <div className='flex justify-center items-center h-[calc(80vh-100px)]'>
      <MaxWidthWrapper className='pt-10 divide-x-2 flex flex-col md:flex-row mt-6'>
        <div className='divide-y-2 md:w-full'>
          <h1 className='text-3xl font-semibold text-zinc-800'>Billing status</h1>
          <p className='font-semibold text-xl mt-10 flex flex-row'>
            You are on the <span className='text-blue-600'>&nbsp;Pro&nbsp;</span>{' '}
            plan&nbsp;<span><Gem className='text-blue-600' /></span>
          </p>
        </div>
        <div className='divide-y-2 pt-20 md:pt-0 md:w-200 flex-col flex p-6'>
          <li className='mt-6'>
            Status:{' '}
            {String(status) === 'ACTIVE' ? (
              <span className='text-blue-600'>{status}</span>
            ) : (
              <span className='text-red-400'>{status}</span>
            )}
          </li>
          <li className='mt-6'>
            {String(status) === 'ACTIVE' ? (
              <span>Auto renewal on: {renewDate}</span>
            ) : (
              <span>Ends at: {renewDate}</span>
            )}
          </li>
          {String(status) === 'ACTIVE' ? (
            <li className='mt-6'>Ends at: {endDate}</li>
          ) : String(status) === 'UNVERIFIED' ? (
            <li className='mt-6'>
              Click{' '}
              <Link href={plan.short_url} className='text-blue-600 cursor-pointer'>
                here
              </Link>{' '}
              to get verified <span className='text-zinc-600'>(one time only)</span>
            </li>
          ) : String(status) === 'CANCELLED' ? (
            <ul className='text-zinc-600 text-sm mt-6'>
              *Your plan will get cancelled after the current ending date
            </ul>
          ) : null}
          
          {String(status) === 'ACTIVE' ? (
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="bg-red-400 hover:bg-red-500 transition-colors cursor-pointer mt-6">
                 {cancelLoading? 'Cancelling...': 'Cancel Subscription'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Your Pro Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your Pro subscription? This action will:
                    <br />
                    <br />
                    • Cancel your subscription at the end of the current billing period ({endDate})
                    <br />
                    • Remove access to Pro features after {endDate}
                    <br />
                    • This action cannot be easily undone
                    <br />
                    <br />
                    You will continue to have access to Pro features until {endDate}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="bg-red-400 hover:bg-red-500"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Yes, Cancel my subscription'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
        <div className='flex justify-center items-center'></div>
      </MaxWidthWrapper>
    </div>
  );
}
