import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { privateProcedure, publicProcedure, router } from "./trpc"
import { TRPCError } from "@trpc/server"
import { db } from "@/db"
import { z } from "zod"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import Razorpay from "razorpay"

enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    UNVERIFIED = 'UNVERIFIED',
    CANCELLED = 'CANCELLED',
}
export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.id || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' })

        const dbUser = await db.user.findFirst({
            where: {
                id: user.id
            }
        })

        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email
                }
            })
        }
        return { success: true }
    }),
    // Enhanced tRPC procedure with billing status checks and updates
checkSubscription: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
    const dbUser = await db.user.findFirst({
        where: {
            id: userId
        }
    })

    if (!dbUser) throw new TRPCError({ code: 'NOT_FOUND' })

    // Initialize Razorpay instance
    const razorpayInstance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        key_secret: process.env.RAZORPAY_SECRET_ID as string,
    });

    let subscriptionId = dbUser.SubscriptionId
    let status = dbUser.status
    let isSubscribed = false
    let currentPeriodEnd = dbUser.CurrentPeriodEnd ? new Date(dbUser.CurrentPeriodEnd) : null
    let remainingCount = dbUser.remainingCount ?? 0
    let short_url = dbUser.short_url || null

    // If user has a subscription ID, fetch and update billing status
    if (subscriptionId) {
        try {
            const subscription = await razorpayInstance.subscriptions.fetch(subscriptionId);

            // Update short_url if it has changed
            if (subscription.short_url && subscription.short_url !== dbUser.short_url) {
                await db.user.update({
                    where: { id: userId },
                    data: {
                        short_url: subscription.short_url,
                    },
                });
                short_url = subscription.short_url;
            }

            // Check if subscription has current_end
            if (subscription.current_end != null) {
                const subscriptionEndTimestamp = subscription.current_end;
                const currentTimestamp = Math.floor(Date.now() / 1000);

                if (subscriptionEndTimestamp < currentTimestamp) {
                    // Subscription is expired - update to inactive
                    await db.user.update({
                        where: { id: userId },
                        data: {
                            status: 'INACTIVE',
                            remainingCount: 0,
                            CurrentPeriodEnd: null,
                            SubscriptionId: null,
                        },
                    });
                    
                    status = 'INACTIVE';
                    subscriptionId = null;
                    currentPeriodEnd = null;
                    remainingCount = 0;
                    isSubscribed = false;
                } else {
                    // Subscription is still active - update if necessary
                    const currentEndDate = new Date(subscriptionEndTimestamp * 1000);
                    let newStatus = 'UNVERIFIED';
                    
                    if (currentEndDate && subscriptionId) {
                        newStatus = 'ACTIVE';
                    }

                    // Update database if status is UNVERIFIED or data needs updating
                    if (dbUser.status === 'UNVERIFIED' || 
                        dbUser.CurrentPeriodEnd?.getTime() !== currentEndDate.getTime() ||
                        dbUser.remainingCount !== Number(subscription.remaining_count)) {
                        
                        // Don't update if user is CANCELLED with 0 remaining count
                        if (!(dbUser.status === 'CANCELLED' && dbUser.remainingCount === 0)) {
                            await db.user.update({
                                where: { id: userId },
                                data: {
                                    status: UserStatus[newStatus as keyof typeof UserStatus],
                                    remainingCount: Number(subscription.remaining_count) ?? 0,
                                    CurrentPeriodEnd: currentEndDate,
                                    SubscriptionId: subscription.id,
                                },
                            });
                            
                            status = UserStatus[newStatus as keyof typeof UserStatus];
                            remainingCount = Number(subscription.remaining_count) ?? 0;
                            currentPeriodEnd = currentEndDate;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching subscription from Razorpay:', error);
            // Continue with existing database values if API call fails
        }
    }

    // Determine if user is subscribed based on current status
    if (String(status) === 'ACTIVE' || String(status) === 'UNVERIFIED' || String(status) === 'CANCELLED') {
        isSubscribed = true
    }

    // Calculate new period end based on remaining count
    const totalDays = 30 * remainingCount;
    const newPeriodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd.getTime() + totalDays * 24 * 60 * 60 * 1000)
        : null;

    return { 
        isSubscribed, 
        subscriptionId, 
        status, 
        newPeriodEnd, 
        currentPeriodEnd, 
        short_url,
        remainingCount // Added for completeness
    }
}),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        return await db.file.findMany({
            where: {
                userId
            }
        })
    }),
    getFile: privateProcedure.input(z.object({
        key: z.string()
    })).mutation(async ({ ctx, input }) => {
        const { userId } = ctx

        const file = await db.file.findFirst({
            where: {
                key: input.key,
                userId
            },
        })

        if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

        return { id: file.id };
    }),

    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ input, ctx }) => {
            const file = await db.file.findFirst({
                where: {
                    id: input.fileId,
                    userId: ctx.userId,
                },
            })

            if (!file) return { status: 'PENDING' as const }

            return { status: file.uploadStatus }
        }),

    deleteFile: privateProcedure.input(
        z.object({ id: z.string() })
    ).mutation(async ({ ctx, input }) => {
        const { userId } = ctx

        const file = await db.file.findFirst({
            where: {
                id: input.id,
                userId,
            }
        })
        if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

        await db.file.delete({
            where: {
                id: input.id,
            }
        })
        return file
    }),
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                fileId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { userId } = ctx
            const { fileId, cursor } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    userId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            const messages = await db.message.findMany({
                take: limit + 1,
                where: {
                    fileId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                },
            })

            let nextCursor: typeof cursor | undefined = undefined
            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }

            return {
                messages,
                nextCursor,
            }
        }),
})
export type AppRouter = typeof appRouter