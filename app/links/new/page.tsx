import LinkForm from "@/components/link-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function Link({ params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: link } = await supabase.rpc('get_link_by_id', { link_id: id })
 
  const { data: account } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">New Link</h1>
      <LinkForm link={link} account={account} />
    </div>
  )
}