import { cookies, headers } from "next/headers"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"

import AccountForm from "@/components/account"

export default async function Account() {
  const supabase = createServerComponentSupabaseClient({ cookies, headers })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user.id
  const {
    data: userData,
    error,
    status,
  } = await supabase.from("profiles").select("*").eq("id", user).single()
  const name = userData?.full_name
  const email = userData?.email

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Account</h1>
      <AccountForm user={user!} name={name!} email={email!} />
    </div>
  )
}
