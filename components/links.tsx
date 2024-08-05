"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { MenuIcon } from "lucide-react"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { toast } from "./ui/use-toast"

type User = Database["public"]["Tables"]["users"]["Row"]
type Link = Database["public"]["Tables"]["links"]["Row"] & { view_count: number }

export function Links({ links, account }: { links: Link[]; account: User }) {
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const filteredLinks = links.filter((link) =>
    link.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "n/a"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "2-digit" 
    })
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/6">Filename</TableHead>
              <TableHead className="w-1/6">Link</TableHead>
              <TableHead className="w-1/6">Created</TableHead>
              <TableHead className="w-1/6">Expires</TableHead>
              <TableHead className="w-1/6">Views</TableHead>
              <TableHead className="w-1/6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.filename}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => handleCopyLink(link.id)}
                      >
                        {`${process.env.NEXT_PUBLIC_SITE_URL}/view/${link.id.substring(
                          0,
                          6
                        )}...`}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy link</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDate(link.created_at)}</TableCell>
                <TableCell>{link.expires ? formatDate(link.expires) : "Never"}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/analytics/${link.id}`} className="hover:text-blue-500">
                        {link.view_count}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View analytics</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MenuIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={`/links/edit/${link.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteLink(link.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}