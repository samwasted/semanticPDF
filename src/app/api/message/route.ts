import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const POST = async (req: NextRequest) => {
    //endpoint for asking a question to pdf file

    const body = await req.json()

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    const userId = user?.id;

    if (!userId)
        return new Response('Unauthorized', { status: 401 })

    const { fileId, message } = SendMessageValidator.parse(body)

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId
        }
    })

    if (!file) return new Response('Not found', { status: 404 })

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })

    // 1: vectorize message
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    })

    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('chatsemantic')

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id
    })

    const results = await vectorStore.similaritySearch(message, 4)

    const prevMessages = await db.message.findMany({
        where: {
            fileId
        },
        orderBy: {
            createdAt: "asc"
        },
        take: 6
    })

    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" as const : "assistant" as const,
        content: msg.text
    }))

    // Use streamText instead of deprecated OpenAIStream
    const result = await streamText({
        model: openai('gpt-3.5-turbo'),
        temperature: 0,
        messages: [
            {
                role: 'system',
                content:
                    'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
            },
            {
                role: 'user',
                content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
                    if (message.role === 'user') return `User: ${message.content}\n`
                    return `Assistant: ${message.content}\n`
                })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${message}`,
            },
        ],
        // Save completed message to database
        onFinish: async (result) => {
            await db.message.create({
                data: {
                    text: result.text,
                    isUserMessage: false,
                    fileId,
                    userId
                }
            })
        }
    })

    // Return the streaming response
    return result.toTextStreamResponse()
}