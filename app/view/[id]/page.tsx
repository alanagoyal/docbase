import { createClient } from "@/utils/supabase/server"
import ViewLinkForm from "@/components/view-link-form"

export default async function Doc({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const id = params.id

  const { data: link } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .single()

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">
        {link?.title}
      </h1>
      <ViewLinkForm link={link} />
    </div>
  )
}
