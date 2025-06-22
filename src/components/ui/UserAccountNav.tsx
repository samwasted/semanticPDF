'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Button } from './button'
import { Avatar, AvatarFallback } from './avatar'
import Image from 'next/image'
import { Icons } from './Icons'
import Link from 'next/link'
import { Gem } from 'lucide-react'
import { trpc } from '@/_trpc/client'

interface UserAccountNavProps {
  email: string | undefined
  name: string
  imageUrl: string | null
}

const UserAccountNav = ({
  email,
  imageUrl,
  name,
}: UserAccountNavProps) => {

  const shouldFetch = Boolean(email && name);
  // const subscriptionPlan = await getUserSubscriptionPlan()
  const { data: subscriptionData } = trpc.checkSubscription.useQuery(undefined, {
    enabled: shouldFetch
  })
  const isSubscribed = subscriptionData?.isSubscribed ?? false
  imageUrl = null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className='overflow-visible'>
        <Button className='rounded-full h-8 w-8 aspect-square bg-slate-400'>
          <Avatar className='relative w-8 h-8'>
            {imageUrl ? (
              <div className='relative aspect-square h-full w-full'>
                <Image
                  fill
                  src={imageUrl}
                  alt='profile picture'
                  referrerPolicy='no-referrer'
                />
              </div>
            ) : (
              <AvatarFallback className='cursor-pointer'>
                <span className='sr-only'>{name}</span>
                <Icons.user className='h-4 w-4 text-zinc-900' />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-0.5 leading-none'>
            {name && (
              <p className='font-medium text-sm text-black'>
                {name}
              </p>
            )}
            {email && (
              <p className='w-[200px] truncate text-xs text-zinc-700'>
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className='cursor-pointer' asChild>
          <Link href='/dashboard'>Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className='cursor-pointer' asChild>
          <DropdownMenuItem className='cursor-pointer' asChild>
            {isSubscribed ? (
              <Link href="/billing">
                Manage Subscription
              </Link>
            ) : (
              <Link href="/pricing">
                Upgrade <Gem className='text-blue-600 h-4 w-4 ml-1.5' />
              </Link>
            )}
          </DropdownMenuItem>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className='cursor-pointer' asChild>
          <Link href='/api/auth/logout'>Logout</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav