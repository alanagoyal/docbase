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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

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

  async function onEdit(id: string) {
    const contact = contacts.find((contact) => contact.id === id)
    if (contact) {
      setSelectedContact(contact)
      setIsEditDialogOpen(true)
    }
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
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Name</TableHead>
            <TableHead className="w-1/4">Email</TableHead>
            <TableHead className="w-1/4">Created</TableHead>
            <TableHead className="w-1/4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact: any) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{formatDate(contact.created_at)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <MenuIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(contact.id)}>
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
      {selectedContact && (
        <ContactForm
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          account={account}
          existingContact={selectedContact}
        />
      )}
    </div>
  )
}
