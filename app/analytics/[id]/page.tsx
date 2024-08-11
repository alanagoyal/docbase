import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

import { ViewerData } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import Analytics from "@/components/analytics"

export default async function AnalyticsPage({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_link_analytics", {
    link_id_arg: id,
  })

  if (error) {
    console.error("Error fetching analytics:", error)
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
        <h1 className="text-2xl text-center font-bold mb-6">
          Error fetching analytics
        </h1>
        <Link href="/links">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    )
  }

  const allViewers = data?.[0]?.all_viewers ?? 0
  const uniqueViewers = data?.[0]?.unique_viewers ?? 0
  const allViews = (data?.[0]?.all_views ?? []) as ViewerData[]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Views</h1>
      <Analytics
        allViewers={allViewers}
        uniqueViewers={uniqueViewers}
        allViews={allViews}
      />
    </div>
  )
}
