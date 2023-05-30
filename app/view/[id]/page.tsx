import { cookies, headers } from "next/headers"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"

import ViewLinkForm from "@/components/view-link-form"

export default async function Doc({ params }: { params: { id: string } }) {
  const supabase = createServerComponentSupabaseClient({ cookies, headers })
  const id = params.id

  const { data: link, error } = await supabase
    .from("links")
    .select("id, password, url, user_id (full_name)")
    .eq("id", id)
    .single()

  const fullName = (link as any).user_id.full_name

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">
        {fullName && `${fullName} is sharing a document with you`}
      </h1>
      <ViewLinkForm link={link} />
    </div>
  )
}
