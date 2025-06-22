import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import Dashboard from "../../components/ui/Dashboard"
import Pricing from "@/components/payments/pricing";
export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

  const dbUser = await db.user.findFirst({
    where: { id: user.id }
  });

  if (dbUser?.SubscriptionId !== null) {
    redirect('/billing?origin=pricing')
  }
  return <Pricing />
}