import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import LinkForm from "@/components/link-form"

type Link = Database["public"]["Tables"]["links"]["Row"]

export default async function EditLink({ params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: link } = (await supabase
    .rpc("select_link", {
      link_id: id,
    })
    .single()) as { data: Link | null }

  const { data: account, error } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user?.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Link</h1>
      {link ? (
        <LinkForm link={link} account={account} />
      ) : (
        <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
          <h1 className="text-2xl text-center font-bold mb-6">
            Oops! This link doesn&apos;t exist
          </h1>
          <Link href="/links">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
