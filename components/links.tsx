"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Activity, Copy, Edit, Trash } from "lucide-react"

import { Database } from "@/types/supabase"

import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { toast } from "./ui/use-toast"

type User = Database["public"]["Tables"]["users"]["Row"]
type Link = Database["public"]["Tables"]["links"]["Row"]

export function Links({ links, account }: { links: Link[]; account: User }) {
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
    await supabase.rpc("delete_link", {
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
              <p className="text-md font-medium leading-none">
                {link.filename}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(link.created_at).toLocaleString("en-US")}
              </p>
            </div>
            <div className="flex items-center space-x-2 mr-4">
              <Link href={`/analytics/${link.id}`}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Analytics</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
              <Link href={`/edit/${link.id}`}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-gray-100 rounded"
                      onClick={() => handleCopyLink(link.id)}
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-gray-100 rounded"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground" />
                    </Button>
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
