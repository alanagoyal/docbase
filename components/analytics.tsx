"use client"

import { Viewers } from "./viewers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users } from "lucide-react"

export default function Analytics({ allViewers, uniqueViewers, allViews }: { allViewers: number, uniqueViewers: number, allViews: any }) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium pr-4">
              Total Views
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allViewers}</div>
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
            <div className="text-2xl font-bold">{uniqueViewers}</div>
          </CardContent>
        </Card>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Views</CardTitle>
          <CardDescription>
            {allViewers > 0
              ? `More information about your views`
              : "No views yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Viewers allViews={allViews} />
        </CardContent>
      </Card>
    </div>
  )
}