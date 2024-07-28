import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Viewers({ allViews }: { allViews: any }) {
  return (
    <div>
      {allViews &&
        allViews.map((view: any) => (
          <div className="flex items-center py-2" key={view.email}>
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
