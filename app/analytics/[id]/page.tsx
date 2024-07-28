import { createClient } from "@/utils/supabase/server"
import Analytics from "@/components/analytics"

export default async function AnalyticsPage({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id
  const supabase = createClient()

  const { data: viewers } = await supabase
    .from("viewers")
    .select("*")
    .eq("link_id", id)

  const allViewers = viewers?.length

  const { data: uniqueEmails } = await supabase
    .from("viewers")
    .select("email", { count: "exact" })
    .eq("link_id", id)

  const uniqueViewers = uniqueEmails?.length

  const { data: allViews } = await supabase
    .from("viewers")
    .select("email, viewed_at")
    .eq("link_id", id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Views</h1>
      <Analytics 
        allViewers={allViewers ?? 0} 
        uniqueViewers={uniqueViewers ?? 0} 
        allViews={allViews} 
      />
    </div>
  )
}