import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import BillingStatusPage from "@/components/payments/billing";
export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

  const dbUser = await db.user.findFirst({
    where: { id: user.id }
  });

  if (!dbUser) {
    redirect('/auth-callback?origin=dashboard')
  }
  if(dbUser.SubscriptionId === null){
    redirect('pricing?origin=billing')
  }
  return <BillingStatusPage />
}