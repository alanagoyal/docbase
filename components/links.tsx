"use client"

import Link from "next/link"
import { Activity, Copy, Trash } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { toast } from "./ui/use-toast"
import { createClient } from "@/utils/supabase/client"

import { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"

type User = Database["public"]["Tables"]["users"]["Row"]
type Link = Database["public"]["Tables"]["links"]["Row"]

export function Links({
  links,
    account,
  }: {
  links: Link[]
  account: User
}) {
  const supabase = createClient()
  const router = useRouter()
  const handleCopyLink = (linkId: string) => {
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/view/${linkId}`
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

  const deleteLink = async (linkId: string) => {
    await supabase.rpc('delete_link', {
      link_id: linkId,
      auth_id: account.auth_id,
    })
    toast({
      description: "Your link has been deleted",
    })
    router.refresh()
  }

  return (
    <div>
      {links &&
        links.map((link: any) => (
          <div className="flex items-center py-2" key={link.id}>
            <div className="flex-1 ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {link.filename}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(link.created_at).toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <Link href={`/analytics/${link.id}`}>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Copy
                      className="h-4 w-4 ml-4 text-muted-foreground"
                      onClick={() => handleCopyLink(link.id)}
                      style={{ cursor: "pointer" }}
                    />
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
                      onClick={() => deleteLink(link.id)}
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
