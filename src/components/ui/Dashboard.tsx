"use client"

import { Ghost, Loader2, MessageSquare, Plus, Trash, Upload } from "lucide-react";
import UploadButton from "./UploadButton";
import { trpc } from "@/_trpc/client";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "./button";
import { useEffect, useState } from "react";

const Dashboard = () => {

  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(
    null
  )

  const { data: subscriptionData } = trpc.checkSubscription.useQuery()
  const isSubscribed = subscriptionData?.isSubscribed ?? false

  console.log("is subscribed ",isSubscribed)
  const utils = trpc.useUtils()

  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  const {mutate: deleteFile} = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate()
    },
    onMutate({id}){
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    }
  })

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My files</h1>

        <UploadButton isSubscribed={isSubscribed}/>
      </div>
      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link href={`/dashboard/${file.id}`}>
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    {/* Blue icon */}
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />

                    {/* Filename */}
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className='h-4 w-4' />
                    {dayjs(file.createdAt).format('MMMM D')}
                  </div>
                  <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />
                    message</div>
                  <Button size="sm" className="w-full 
                  bg-red-700/50 hover:bg-red-700/60"
                  variant='destructive'
                  onClick={() => deleteFile({id: file.id})}
                  
                  >
                    {currentlyDeletingFile === file.id ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Trash className="h-3 w-3" />)}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Let&apos;s upload your first pdf</p>
        </div>
      )}
    </main>
  );
}
export default Dashboard;