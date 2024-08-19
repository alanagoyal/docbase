import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Account from "@/components/account"

export default async function AccountPage() {
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
    .eq("id", user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Account</h1>
      <Account account={account}/>
    </div>
  )
}