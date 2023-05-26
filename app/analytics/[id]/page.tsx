"use client"

import { useEffect, useState } from "react"
import { Activity, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Viewers } from "@/components/viewers"
import { useSupabase } from "@/app/supabase-provider"

export default function Analytics({ params }: { params: { id: string } }) {
  const [totalViews, setTotalViews] = useState<any>(null)
  const [uniqueViews, setUniqueViews] = useState<any>(null)
  const [allViews, setAllViews] = useState<any>(null)
  const id = params.id
  const { supabase } = useSupabase()
  console.log(allViews)

  useEffect(() => {
    getAnalytics()
  }, [])

  async function getAnalytics() {
    const { data: viewers } = await supabase
      .from("viewers")
      .select("email")
      .eq("link_id", id)

    setUniqueViews(viewers?.length)

    const { data: uniqueEmails } = await supabase
      .from("viewers")
      .select("email", { count: "exact" })
      .eq("link_id", id)

    setTotalViews(uniqueEmails?.length)

    const { data: allViews } = await supabase
      .from("viewers")
      .select("email, viewed_at")
      .eq("link_id", id)

    setAllViews(allViews)
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Views</h1>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium pr-4">
                    Total Views
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews}</div>
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium pr-4">
                    Unique Views
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueViews}</div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Recent Views</CardTitle>
                <CardDescription>
                  More information about your {totalViews} views
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
