import { useEffect, useState } from "react"
import { cookies, headers } from "next/headers"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { Card, Metric, Text } from "@tremor/react"
import { Activity, Users } from "lucide-react"

import {
  // Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Viewers } from "@/components/viewers"
import { useSupabase } from "@/app/supabase-provider"

export default async function Analytics({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id

  const supabase = createServerComponentSupabaseClient({ cookies, headers })

  const { data: viewers } = await supabase
    .from("viewers")
    .select("*")
    .eq("link_id", id)

  const allViews = [
    {
      email: "alana@example.com",
      viewed_at: "2023-07-22T12:34:56Z",
    },
    {
      email: "mathu@example.com",
      viewed_at: "2023-07-21T09:15:30Z",
    },
  ]
  const allViewers = allViews?.length

  const { data: uniqueEmails } = await supabase
    .from("viewers")
    .select("email", { count: "exact" })
    .eq("link_id", id)

  const uniqueViewers = uniqueEmails?.length

  // const { data: allViews } = await supabase
  //   .from("viewers")
  //   .select("email, viewed_at")
  //   .eq("link_id", id)

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Views</h1>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
              <Card className="max-w-xs mx-auto">
                <Text>Total Views</Text>
                <Activity className="h-4 w-4 text-muted-foreground" />
                <Metric>{allViewers}</Metric>
              </Card>
              <Card className="max-w-xs mx-auto">
                <Text>Unique Views</Text>
                <Users className="h-4 w-4 text-muted-foreground" />
                <Metric>{uniqueViewers}</Metric>
              </Card>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Recent Views</CardTitle>
                <CardDescription>
                  More information about your {allViewers} views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Viewers allViews={allViews} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
