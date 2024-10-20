import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { MessagesTable } from "@/components/messages"
import { NewMessageButton } from "@/components/new-message"

export default async function Messages() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

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
    .maybeSingle()

  if (contactsError || groupsError || contactGroupsError || domainError) {
    console.error(
      "Error fetching data:",
      contactsError || groupsError || contactGroupsError || domainError
    )
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

  if (error) {
    console.error("Error fetching messages:", error)
  }

  return messages && messages.length > 0 ? (
    <MessagesTable
      messages={messages}
      groups={formattedGroups}
      contacts={contactsWithGroups || []}
      account={account}
      domain={domain}
    />
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t sent <br /> any messages yet
      </h1>
      <NewMessageButton
        account={account}
        groups={formattedGroups}
        contacts={contactsWithGroups || []}
        domain={domain}
      />
    </div>
  )
}
