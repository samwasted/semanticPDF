'use client';

import { trpc } from "@/_trpc/client"
import Messages from "./Messages"
import ChatInput from "./ChatInput"
import { ChevronLeft, Loader2, XCircle } from "lucide-react"
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";


interface ChatWrapperProps {
  fileId: string
}

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  console.log('fileId', fileId)

  const { data, isLoading } =
    trpc.getFileUploadStatus.useQuery(
      {
        fileId,
      },
      {
        refetchInterval: (query) => {
          const status = query.state.data?.status;
          return status === 'SUCCESS' || status === 'FAILED'
            ? false
            : 500;
        },
      }
    )
    if(isLoading) return(
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="font-semibold text-xl animate-spin text-primary"/>
            Loading...
            <p className="text-zinc-500 text-sm">
              We're preparing your PDF.
            </p>
          </div>
        </div>
      </div>
    )

    if(data?.status === "PROCESSING") return (
       <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="font-semibold text-xl animate-spin text-primary"/>
            Processing PDF...
            <p className="text-zinc-500 text-sm">
              This won't take long.
            </p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    )
    if(data?.status === "FAILED") return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="font-semibold text-xl text-red-500"/>
            Too many pages in the PDF...
            <p className="text-zinc-500 text-sm">
              Your <span className="font-medium">Free</span> plan supports upto 5 pages per PDF.
            </p>
            <Link href='/dashboard' className={buttonVariants({
              variant: "secondary",
              className: "mt-4"
            })}
            ><ChevronLeft className="h-3 w-3 mr-1.5"/>Back</Link>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    )

  return (
  <ChatContextProvider fileId={fileId}>
  <div className="relative h-[calc(100vh-3.5rem)] bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between">
    <div className="flex-1 justify-between flex flex-col mb-28">
      <Messages fileId={fileId}/>
    </div>

    <ChatInput isDisabled={false} />

  </div>
  </ChatContextProvider>)
}
export default ChatWrapper