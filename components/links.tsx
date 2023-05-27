import Link from "next/link"
import { Activity, Eye, Trash } from "lucide-react"

export function Links({
  allLinks,
  onDeleteLink,
}: {
  allLinks: any
  onDeleteLink: (linkId: string) => void
}) {
  return (
    <div>
      {allLinks &&
        allLinks.map((link: any) => (
          <div className="flex items-center py-2" key={link.id}>
            <div className="flex-1 ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {link.filename}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(link.created_at).toISOString()}
              </p>
            </div>
            <div>
              <Link href={link.url}>
                {" "}
                <Activity className="h-4 w-4 ml-4 text-muted-foreground" />
              </Link>
            </div>
            <div>
              <Link href={`/analytics/${link.id}`}>
                {" "}
                <Eye className="h-4 w-4 ml-4 text-muted-foreground" />
              </Link>
            </div>
            <div>
              <Trash
                className="h-4 w-4 ml-4 text-muted-foreground"
                onClick={() => onDeleteLink(link.id)}
              />
            </div>
          </div>
        ))}
    </div>
  )
}
