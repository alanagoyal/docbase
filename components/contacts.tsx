"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { MailPlus, MenuIcon, Plus, Mail } from "lucide-react"

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
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
import ContactForm from "./contact-form"
import { Icons } from "./icons"
import { StyledQuillEditor } from "./quill-editor"

type Contact = Database["public"]["Tables"]["contacts"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]
type Domain = Database["public"]["Tables"]["domains"]["Row"]
type Group = { value: string; label: string; color: string }

export function ContactsTable({
  contacts,
  account,
  domain,
  groups,
}: {
  contacts: (Contact & { groups: Group[] })[]
  account: User
  domain: Domain | null
  groups: Group[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [selectedContactEmail, setSelectedContactEmail] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<
    (Contact & { groups: Group[] }) | null
  >(null)
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false)
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [newMessageTo, setNewMessageTo] = useState("")
  const [newMessageSubject, setNewMessageSubject] = useState("")
  const [newMessageBody, setNewMessageBody] = useState("")

  useEffect(() => {
    const handleGlobalClick = () => {
      document.body.style.pointerEvents = "auto"
    }

    document.addEventListener("click", handleGlobalClick)

    return () => {
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [])

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false)
    setSelectedContact(null)
    document.body.focus()
  }, [])

  const handleEmailButtonClick = useCallback((contactEmail: string) => {
    if (!domain) {
      toast({
        title: "Domain required",
        description: "Please add a domain to your account to start sending emails",
        action: (
          <Button variant="outline" onClick={() => router.push('/account?tab=domain')}>
            Account
          </Button>
        ),
      })
    } else {
      setSelectedContactEmail(contactEmail)
      setIsEmailDialogOpen(true)
    }
  }, [domain, router])

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

  const fetchDomainInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("domains")
        .select("domain_name, sender_name, api_key")
        .eq("user_id", userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching domain information:", error)
      return null
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const domainInfo = await fetchDomainInfo(account.id)
      if (!domainInfo) {
        throw new Error("Failed to fetch domain information")
      }

      const to = newMessageTo || selectedContactEmail
      const subject = newMessageSubject || emailSubject
      const body = newMessageBody || emailBody

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          emailBody: body,
          domainName: domainInfo.domain_name,
          senderName: domainInfo.sender_name,
          apiKey: domainInfo.api_key,
        }),
      })

      if (response.ok) {
        toast({
          description: "Email sent successfully",
        })
        setIsEmailDialogOpen(false)
        setIsNewMessageDialogOpen(false)
        setEmailSubject("")
        setEmailBody("")
        setNewMessageTo("")
        setNewMessageSubject("")
        setNewMessageBody("")
        setSelectedContactEmail("")
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center max-w-5xl mx-auto py-4 relative">
        <div className="w-[150px]" />
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          Contacts
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => setIsNewMessageDialogOpen(true)}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">New Message</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsNewContactDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">New Contact</span>
          </Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
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
                        onClick={() => handleEmailButtonClick(contact.email)}
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
                            onSelect={() => {
                              setSelectedContact(contact)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(contact.id)}
                          >
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
                <DialogDescription>Compose and send an email to the selected contact</DialogDescription>
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
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                handleEditDialogClose()
              }
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>Update the details of the selected contact</DialogDescription>
              </DialogHeader>
              {selectedContact && (
                <ContactForm
                  existingContact={selectedContact}
                  account={account}
                  groups={groups}
                  onSuccess={() => {
                    handleEditDialogClose()
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
          <Dialog
            open={isNewContactDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsNewContactDialogOpen(false)
              }
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Contact</DialogTitle>
                <DialogDescription>Add a new contact to your list</DialogDescription>
              </DialogHeader>
              <ContactForm
                account={account}
                groups={groups}
                onSuccess={() => {
                  setIsNewContactDialogOpen(false)
                  router.refresh()
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog
            open={isNewMessageDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsNewMessageDialogOpen(false)
                setNewMessageTo("")
                setNewMessageSubject("")
                setNewMessageBody("")
              }
            }}
          >
            <DialogContent className="flex flex-col max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Compose and send a new email</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 flex-grow">
                <Input
                  placeholder="To"
                  value={newMessageTo}
                  onChange={(e) => setNewMessageTo(e.target.value)}
                />
                <Input
                  placeholder="Subject"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                />
                <div className="flex flex-col gap-2 flex-grow">
                  <StyledQuillEditor
                    value={newMessageBody}
                    onChange={setNewMessageBody}
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
      </div>
    </div>
  )
}