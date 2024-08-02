import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import MagicLink from "@/components/magic-link"
import InvestmentForm from "@/components/investment-form"

export default async function Safe({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const sharing = searchParams.sharing === "true"
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (sharing) {
      return (
        <div className="w-full min-h-screen max-w-md flex flex-col pt-4">
          <MagicLink redirect="sharing" />
        </div>
      )
    } else {
      redirect("/login")
    }
  }

  const { data: account, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()
    
  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6 text-center">New Link</h1>
    <InvestmentForm  account={account} />
  </div>
  )
}