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
type Document = {
  id: string
  document_type: string
  document_url: string
  document_name: string
  created_at: string
}
export function Documents({
  documents,
  account,
}: {
  documents: Document[]
  account: User
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const filteredDocuments = documents.filter((document) =>
    document.document_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteDocument = async (documentId: string) => {
    // Implement delete functionality
    toast({
      description: "Your document has been deleted",
    })
    router.refresh()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "n/a"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  const getEditLink = (document: Document) => {
    switch (document.document_type.toLowerCase()) {
      case 'link':
        return `/links/${document.id}`
      case 'safe':
      case 'side letter':
        return `/investments/new?id=${document.id}&edit=true${document.document_type.toLowerCase() === 'side letter' ? '&step=3' : ''}`
      default:
        return '#'
    }
  }

  const getViewLink = (document: Document) => {
    switch (document.document_type.toLowerCase()) {
      case 'link':
        return '/links'
      case 'safe':
      case 'side letter':
        return '/investments'
      default:
        return '#'
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">Document Name</TableHead>
              <TableHead className="w-1/5">Document Type</TableHead>
              <TableHead className="w-1/5">Document URL</TableHead>
              <TableHead className="w-1/5">Created At</TableHead>
              <TableHead className="w-1/5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">
                  {document.document_name}
                </TableCell>
                <TableCell>{document.document_type}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={document.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer hover:text-blue-500"
                      >
                        {document.document_url.substring(0, 20)}...
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open document</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MenuIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={getViewLink(document)}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={getEditLink(document)}>Edit</Link>
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