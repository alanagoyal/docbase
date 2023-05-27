import Link from "next/link"
import { Activity, Copy, Eye, Trash } from "lucide-react"

export function Links({
  allLinks,
  onDeleteLink,
}: {
  allLinks: any
  onDeleteLink: (linkId: string) => void
}) {
  const handleCopyLink = (linkId: string) => {
    const link = `https://docbase.vercel.app/links/${linkId}`
    navigator.clipboard
      .writeText(link)
      .then(() => {
        console.log("Link copied to clipboard:", link)
      })
      .catch((error) => {
        console.error("Failed to copy link:", error)
      })
  }
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
              <Link href={`/analytics/${link.id}`}>
                {" "}
                <Activity className="h-4 w-4 ml-4 text-muted-foreground" />
              </Link>
            </div>
            <div>
              {" "}
              <Copy
                className="h-4 w-4 ml-4 text-muted-foreground"
                onClick={() => handleCopyLink(link.id)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div>
              <Trash
                className="h-4 w-4 ml-4 text-muted-foreground"
                onClick={() => onDeleteLink(link.id)}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        ))}
    </div>
  )
}
