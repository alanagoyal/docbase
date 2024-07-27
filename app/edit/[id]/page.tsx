import LinkForm from "@/components/link-form"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"

type Link = Database["public"]["Tables"]["links"]["Row"]

export default async function Link({ params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: link } = await supabase.rpc("select_link", {
    link_id: id,
  }).single() as { data: Link | null };

  const { data: account, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Edit Link</h1>
      <LinkForm link={link} account={account} />
    </div>
  )
}
