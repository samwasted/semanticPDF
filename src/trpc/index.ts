import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { privateProcedure, publicProcedure, router } from "./trpc"
import { TRPCError } from "@trpc/server"
import { db } from "@/db"
import { z } from "zod"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
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
    checkSubscription: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        const dbUser = await db.user.findFirst({
            where: {
                id: userId
            }
        })

        if (!dbUser) throw new TRPCError({ code: 'NOT_FOUND' })
        const subscriptionId = dbUser.SubscriptionId
        const status = dbUser.status
        let isSubscribed = false

        if (String(status) === 'ACTIVE' || String(status) === 'UNVERIFIED' || String(status) === 'CANCELLED') {
            isSubscribed = true
        }
        const currentPeriodEnd = dbUser.CurrentPeriodEnd ? new Date(dbUser.CurrentPeriodEnd) : null; // Date object
        const remainingCount = dbUser.remainingCount ?? 0;          // Number of months, default to 0 if null

        const totalDays = 30 * remainingCount;
        const newPeriodEnd = currentPeriodEnd
            ? new Date(currentPeriodEnd.getTime() + totalDays * 24 * 60 * 60 * 1000)
            : null;
        
        const short_url = dbUser.short_url || null;

        return { isSubscribed, subscriptionId, status, newPeriodEnd, currentPeriodEnd, short_url }
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