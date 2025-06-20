import ChatWrapper from "@/components/chat/ChatWrapper"
import PdfRenderer from "@/components/ui/PdfRenderer"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"



const Page = async function (props: { params: Promise<{ fileId: string }> }) {
    // Retrieve the file Id
    const { fileId } = await props.params;
    
    // Get user
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`)

    // Make database call
    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: user.id
        }
    })
    
    if (!file) notFound()

    return (
        <div className="flex-1 justify-between flex flex-col h-[calc(100vh-4.5rem)]">
            <div className="mx-auto w-full max-w-6xl grow lg:flex xl:px-2">
                {/* Left side - PDF viewer */}
                <div className="flex-1 xl:flex">
                    <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6 flex flex-col">
                        <PdfRenderer url={file.url} />
                    </div>
                </div>

                {/* Right side - Chat */}
                <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
                    <ChatWrapper fileId={file.id}/>
                </div>
            </div>
        </div>
    )
}

export default Page