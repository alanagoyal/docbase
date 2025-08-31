import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Links } from "@/components/links"

export const dynamic = "force-dynamic"

export default async function LinksPage() {
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

  const { data: links } = await supabase.rpc("get_user_links_with_views", {
    id_arg: user.id,
  })

  // Fetch contacts, groups, and domain for email sharing
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("created_by", user.id)
    .order("updated_at", { ascending: true })

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, color")
    .eq("created_by", user.id)

  const { data: contactGroups } = await supabase
    .from("contact_groups")
    .select("contact_id, group_id")
    .in("contact_id", contacts?.map((c) => c.id) || [])

  const { data: domain } = await supabase
    .from("domains")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

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

  return links && links.length > 0 ? (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center max-w-5xl mx-auto py-4 relative">
        <div className="w-[150px]" />
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          Links
        </h1>
        <Link href="/links/new">
          <Button variant="ghost" className="w-[150px]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">New</span>
          </Button>
        </Link>
      </div>
      <div className="max-w-5xl mx-auto">
        <Links 
          links={links} 
          account={account} 
          contacts={contactsWithGroups || []}
          groups={formattedGroups}
          domain={domain}
        />
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t created <br /> any links yet
      </h1>
      <Link href="/links/new">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}