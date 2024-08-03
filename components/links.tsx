"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Activity, Copy, Edit, MenuIcon, Trash } from "lucide-react"

import { Database } from "@/types/supabase"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Filename</TableHead>
            <TableHead className="w-1/6">Created</TableHead>
            <TableHead className="w-1/6">Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links &&
            links.map((link: any) => (
              <TableRow key={link.id}>
                <TableCell>{link.filename}</TableCell>
                <TableCell>
                  {new Date(link.created_at).toLocaleString("en-US")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-between items-center">
                    {link.expirres
                      ? new Date(link.expires).toLocaleString("en-US")
                      : "n/a"}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center">
                        <MenuIcon className="h-4 w-4 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>
                          <Link href={`/analytics/${link.id}`}>Analytics</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/edit/${link.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteLink(link.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
