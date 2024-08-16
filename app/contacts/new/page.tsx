import ContactForm from "@/components/contact-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function NewContact() {
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

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, color")
    .eq("created_by", user.id)

  const formattedGroups = groups?.map(group => ({
    value: group.id,
    label: group.name,
    color: group.color
  })) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">New Contact</h1>
      <ContactForm account={account} groups={formattedGroups} />
    </div>
  )
}