"use client"

import Link from "next/link"
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
}: {
  documents: Document[]
}) {


  const getEditLink = (document: Document) => {
    const fileName = document.document_name.toLowerCase();
    if (fileName.includes('safe') || fileName.includes('side letter')) {
      return `/investments/${document.id}${fileName.includes('side letter') ? '?step=3' : ''}`;
    }
    return `/links/edit/${document.id}`;
  }

  const getViewLink = (document: Document) => {
    const fileName = document.document_name.toLowerCase();
    if (fileName.includes('safe') || fileName.includes('side letter')) {
      return `/investments/${document.id}`;
    }
    return `/links/view/${document.id}`;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "n/a"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      timeZone: "UTC"
    })
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">Document</TableHead>
              <TableHead className="w-1/5">Type</TableHead>
              <TableHead className="w-1/5">Link</TableHead>
              <TableHead className="w-1/5">Created</TableHead>
              <TableHead className="w-1/5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
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
                        {document.document_url.substring(0, 18)}...
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