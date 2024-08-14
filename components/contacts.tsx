"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { MenuIcon, Trash } from "lucide-react"

import { Database } from "@/types/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import ContactForm from "./contact-form"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { toast } from "./ui/use-toast"

type Contact = Database["public"]["Tables"]["contacts"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

export function ContactsTable({
  contacts,
  account,
}: {
  contacts: Contact[]
  account: User
}) {
  const supabase = createClient()
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  async function onDelete(id: string) {
    try {
      let { error } = await supabase.from("contacts").delete().eq("id", id)
      if (error) throw error
      toast({
        description: "Your contact has been deleted",
      })
      router.refresh()
    } catch (error) {}
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact: any) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {new Date(contact.created_at).toLocaleString("en-US")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <MenuIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(contact.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ContactForm
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={account}
      />
    </>
  )
}
