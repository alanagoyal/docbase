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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {link.filename}
      </h1>
      <ViewLinkForm link={link} />
    </div>
  )
}
