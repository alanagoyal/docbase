"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { MailPlus, MenuIcon } from "lucide-react"

import { Database } from "@/types/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"
import "react-quill/dist/quill.snow.css"
import "@/styles/quill-custom.css"
import { Icons } from "./icons"
import { StyledQuillEditor } from "./quill-editor"

type Contact = Database["public"]["Tables"]["contacts"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]
type Group = { value: string; label: string; color: string }

export function ContactsTable({
  contacts,
  account,
  groups,
}: {
  contacts: (Contact & { groups: Group[] })[]
  account: User
  groups: Group[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [selectedContactEmail, setSelectedContactEmail] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

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

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedContactEmail,
          subject: emailSubject,
          emailBody: emailBody,
        }),
      })

      if (response.ok) {
        toast({
          description: "Email sent successfully",
        })
        setIsEmailDialogOpen(false)
        setEmailSubject("")
        setEmailBody("")
      } else {
        const errorData = await response.json()
        console.error("Failed to send email:", errorData)
        throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("Error in handleSendEmail:", error)
      toast({
        variant: "destructive",
        description: `Failed to send email: ${error}`,
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Name</TableHead>
            <TableHead className="w-1/4">Email</TableHead>
            <TableHead className="w-1/4">Groups</TableHead>
            <TableHead className="w-1/4">Created</TableHead>
            <TableHead className="w-1/4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact: any) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {contact.groups.map((group: Group) => (
                    <Badge
                      key={group.value}
                      style={{
                        backgroundColor: group.color,
                        color: "white",
                      }}
                    >
                      {group.label}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatDate(contact.created_at)}</TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedContactEmail(contact.email)
                      setIsEmailDialogOpen(true)
                    }}
                  >
                    <MailPlus className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MenuIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() =>
                          router.push(`/contacts/edit/${contact.id}`)
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(contact.id)}>
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
      <Dialog
        open={isEmailDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEmailDialogOpen(false)
            setEmailSubject("")
            setEmailBody("")
            setSelectedContactEmail("")
          }
          router.refresh()
        }}
      >
        <DialogContent className="flex flex-col max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 flex-grow">
            <Input
              placeholder="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <div className="flex flex-col gap-2 flex-grow">
              <StyledQuillEditor
                value={emailBody}
                onChange={setEmailBody}
                placeholder="Compose your email..."
              />
            </div>
            <div>
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="w-full"
              >
                {isSendingEmail ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
