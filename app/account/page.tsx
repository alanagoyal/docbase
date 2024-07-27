import AccountForm from "@/components/account"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function Account() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: account } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user.id)
    .single()

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Account</h1>
      <AccountForm account={account} />
    </div>
  )
}
