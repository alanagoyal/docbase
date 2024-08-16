import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { Button } from "@/components/ui/button"
import ContactForm from "@/components/contact-form"

export default async function EditContact({ params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single()

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

  const { data: contactGroups } = await supabase
    .from("contact_groups")
    .select("group_id")
    .eq("contact_id", id)

  const contactWithGroups = contact ? {
    ...contact,
    groups: formattedGroups.filter(g => contactGroups?.some(cg => cg.group_id === g.value))
  } : null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Contact</h1>
      {contactWithGroups ? (
        <ContactForm existingContact={contactWithGroups} account={account} groups={formattedGroups} />
      ) : (
        <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
          <h1 className="text-2xl text-center font-bold mb-6">
            Oops! This contact doesn&apos;t exist
          </h1>
          <Link href="/contacts">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      )}
    </div>
  )
}