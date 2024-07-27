import { createClient } from "@/utils/supabase/server"
import ViewLinkForm from "@/components/view-link-form"
import { Database } from "@/types/supabase"

type Link = Database["public"]["Tables"]["links"]["Row"]

export default async function Doc({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const id = params.id

  const { data: link } = await supabase.rpc("select_link", {
    link_id: id,
  }).single() as { data: Link | null };

  if (!link) {
    return <div>Link not found</div>
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">
        {link.filename}
      </h1>
      <ViewLinkForm link={link} />
    </div>
  )
}
