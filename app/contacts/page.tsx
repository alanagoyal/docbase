import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import ContactForm from "@/components/contact-form"
import { ContactsTable } from "@/components/contacts"

export default async function Contacts() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: account } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single()

  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .eq("created_by", user.id)
    .order("updated_at", { ascending: true })

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id, name, color")
    .eq("created_by", user.id)

  const { data: contactGroups, error: contactGroupsError } = await supabase
    .from("contact_groups")
    .select("contact_id, group_id")
    .in("contact_id", contacts?.map((c) => c.id) || [])

  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (contactsError || groupsError || contactGroupsError || domainError) {
    console.error(
      "Error fetching data:",
      contactsError || groupsError || contactGroupsError || domainError
    )
    // Handle the error appropriately
  }

  const formattedGroups =
    groups?.map((group) => ({
      value: group.id,
      label: group.name,
      color: group.color,
    })) || []

  const contactGroupMap =
    contactGroups?.reduce((acc, cg) => {
      if (!acc[cg.contact_id]) {
        acc[cg.contact_id] = []
      }
      acc[cg.contact_id].push(cg.group_id)
      return acc
    }, {} as Record<string, string[]>) || {}

  const contactsWithGroups = contacts?.map((contact) => ({
    ...contact,
    groups: formattedGroups.filter((g) =>
      contactGroupMap[contact.id]?.includes(g.value)
    ),
  }))

  return contactsWithGroups && contactsWithGroups.length > 0 ? (
    <ContactsTable
      contacts={contactsWithGroups}
      account={account}
      domain={domain}
      groups={formattedGroups}
    />
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t created <br /> any contacts yet
      </h1>
      <Link href="/contacts">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}
