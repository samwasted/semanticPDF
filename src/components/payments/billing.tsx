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
import { Gem, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/_trpc/client';

enum UserStatus {
  ACTIVE,
  INACTIVE,
  CANCELLED,
  UNVERIFIED
}

export default function BillingStatusPage() {
  // const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Proper tRPC query usage
  const { 
    data: subscriptionData, 
    isLoading: loading, 
    error: queryError 
  } = trpc.checkSubscription.useQuery();

  const subscriptionId = subscriptionData?.subscriptionId;

  // Redirect effect with proper condition
  // useEffect(() => {
  //   if (!loading && !queryError) {
  //     const timer = setTimeout(() => {
  //       if (!subscriptionData || !subscriptionId) {
  //         router.replace('/pricing?origin=billing');
  //       }
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [loading, subscriptionData, subscriptionId, router, queryError]);

  const handleCancel = async () => {
    if (!subscriptionId) return;
    setError(null);
    setCancelLoading(true);
    
    try {
      const res = await fetch('/api/cancelSubscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          cancelAtCycleEnd: true,
        }),
      });
      
      if (!res.ok) throw new Error('Cancel failed');
      
      setIsDialogOpen(false);
      window.location.reload();
    } catch {
      setError('Cancellation failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-70px)]'>
        <MaxWidthWrapper className='flex justify-center items-center flex-col'>
          <Loader2 className='w-5 h-5 animate-spin mb-6' />
          <p className='text-zinc-600'>Fetching payment details...</p>
        </MaxWidthWrapper>
      </div>
    );
  }

  if (queryError || error) {
    return <div className="text-red-500">{error || 'Failed to load subscription data'}</div>;
  }

  if (!subscriptionData) {
    return <div className="text-red-500">No subscription data available</div>;
  }

  const { currentPeriodEnd, newPeriodEnd, status, short_url } = subscriptionData;
  const renewDate = dayjs(currentPeriodEnd).format('MMM D, YYYY');
  const endDate = dayjs(newPeriodEnd).format('MMM D, YYYY');

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
              <Link href={short_url || ''} className='text-blue-600 cursor-pointer'>
                here
              </Link>{' '}
              to get verified <span className='text-zinc-600'>(one time only)</span>
            </li>
          ) : String(status) === 'CANCELLED' ? (
            <ul className='text-zinc-600 text-sm mt-6'>
              *Your plan will get cancelled after the current ending date
            </ul>
          ) : null}

          {String(status) === 'ACTIVE' && (
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  className="bg-red-400 hover:bg-red-500 transition-colors cursor-pointer mt-6"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Your Pro Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your Pro subscription? This action will:
                    <br /><br />
                    • Cancel your subscription at the end of the current billing period ({renewDate})
                    <br />
                    • Remove access to Pro features after {renewDate}
                    <br />
                    • This action cannot be easily undone
                    <br /><br />
                    You will continue to have access to Pro features until {renewDate}.
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
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
