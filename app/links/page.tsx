import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Plus } from "lucide-react"

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

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)

  return links && links.length > 0 ? (
    <div className="flex flex-col items-center pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Links</h1>
      <div className="w-half">
        <Links links={links} />
      </div>
    </div>
  ) : (
    <div className="w-full px-4 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-4">
        You haven&apos;t created <br /> any links yet
      </h1>
      <Link className="flex justify-center pt-2" href="/new">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}
