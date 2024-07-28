import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { Button } from "@/components/ui/button"
import { Links } from "@/components/links"

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
    .eq("auth_id", user.id)
    .single()

  const { data: links } = await supabase.rpc("get_user_links", {
    auth_id: account.auth_id,
  })

  return links && links.length > 0 ? (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Links</h1>
      <div className="max-w-2xl mx-auto">
        <Links links={links} account={account} />
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t created <br /> any links yet
      </h1>
      <Link href="/new">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}
