import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
    const {getUser} = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    const dbUser = await db.user.findFirst({
        where: { id: user.id },
    });
    if (!dbUser) {
        return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }
    const status = dbUser.status;
    let subscriptionStatus = false;
    if(String(status) === "CANCELLED" || String(status) === "ACTIVE" || String(status) === "UNVERIFIED") {
        subscriptionStatus = true;
    }
    return new Response(JSON.stringify({
        status: status,
        isSubscribed: subscriptionStatus
    }));
}
