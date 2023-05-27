import Link from "next/link"
import { Activity, Copy, Eye, Trash } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { toast } from "./ui/use-toast"

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
        toast({
          description: "Your link has been copied",
        })
      })
      .catch((error) => {
        toast({
          description: "There was an error copying your link",
        })
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Activity className="h-4 w-4 ml-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>View Analytics</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            </div>
            <div>
              {" "}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Copy
                      className="h-4 w-4 ml-4 text-muted-foreground"
                      onClick={() => handleCopyLink(link.id)}
                      style={{ cursor: "pointer" }}
                    />{" "}
                  </TooltipTrigger>
                  <TooltipContent>Copy Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Trash
                      className="h-4 w-4 ml-4 text-muted-foreground"
                      onClick={() => onDeleteLink(link.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Delete Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
    </div>
  )
}
