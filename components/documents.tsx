"use client"

import Link from "next/link"
import { Download, MenuIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

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
import { isTyping } from "@/utils/is-typing"

type Document = {
  id: string
  document_type: string
  document_url: string
  document_name: string
  created_at: string
}
export function Documents({ documents }: { documents: Document[] }) {
  const router = useRouter()
  const getEditLink = (document: Document) => {
    const fileName = document.document_name.toLowerCase()
    if (fileName.includes("safe") || fileName.includes("side letter")) {
      return `/investments/${document.id}${
        fileName.includes("side letter") ? "?step=3" : ""
      }`
    }
    return `/links/edit/${document.id}`
  }

  const downloadDocument = (url: string) => {
    window.open(url, "_blank")
    toast({ description: "Document downloaded" })
  }

  const handleCopyLink = (documentId: string) => {
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/links/view/${documentId}`
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

  const linkUrl = (document: Document) => {
    return `${process.env.NEXT_PUBLIC_SITE_URL}/links/view/${document.id}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "n/a"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      timeZone: "UTC",
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && !isTyping()) {
        e.preventDefault()
        router.push("/links/new")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

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
                      <span
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => handleCopyLink(document.id)}
                      >
                        {`${linkUrl(document).substring(0, 18)}...`}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy link</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => downloadDocument(document.document_url)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MenuIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={getEditLink(document)}>Edit</Link>
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
    </TooltipProvider>
  )
}
