"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ViewerData } from "@/types/supabase"

export function Viewers({ allViews }: { allViews: ViewerData[] }) {
  return (
    <div>
      {allViews.map((view) => (
        <div className="flex items-center py-2" key={`${view.email}-${view.viewed_at}`}>
          <Avatar className="h-9 w-9">
            <AvatarFallback>{view.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{view.email}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(view.viewed_at).toLocaleString("en-US")}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}