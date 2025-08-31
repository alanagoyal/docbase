"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Mail } from "lucide-react"
import CreatableSelect from "react-select/creatable"
import { selectStyles } from "@/utils/select-styles"

import { Database } from "@/types/supabase"
import { Icons } from "./icons"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"
import { isValidEmail } from "@/utils/validation"
import { clientLogger } from "@/lib/client-logger"

type Link = Database["public"]["Tables"]["links"]["Row"] & {
  view_count: number
}
type User = Database["public"]["Tables"]["users"]["Row"]
type Domain = Database["public"]["Tables"]["domains"]["Row"]
type Contact = Database["public"]["Tables"]["contacts"]["Row"] & { groups: Group[] }
type Group = { value: string; label: string; color: string }

type Recipient = Group | { value: string; label: string; isEmail: true }

interface ShareLinkModalProps {
  link: Link
  account: User
  domain: Domain | null
  contacts: Contact[]
  groups: Group[]
  isOpen: boolean
  onClose: () => void
}

export function ShareLinkModal({
  link,
  account,
  domain,
  contacts,
  groups,
  isOpen,
  onClose,
}: ShareLinkModalProps) {
  const router = useRouter()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [message, setMessage] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  const customComponents = {
    MultiValue: ({ children, removeProps, ...props }: any) => {
      const isEmail = "isEmail" in props.data && props.data.isEmail
      return (
        <div
          className="m-1 flex items-center gap-1 rounded px-2 py-1 text-sm text-white"
          style={{
            backgroundColor: isEmail ? "#6b7280" : props.data.color,
          }}
        >
          {children}
          <span {...removeProps} className="ml-1 cursor-pointer hover:opacity-75">
            ×
          </span>
        </div>
      )
    },
  }

  const handleRecipientChange = (newValue: any, actionMeta: any) => {
    if (actionMeta.action === "create-option") {
      const newOption = newValue[newValue.length - 1]
      if (isValidEmail(newOption.value)) {
        setRecipients([
          ...newValue.slice(0, -1),
          { ...newOption, isEmail: true },
        ])
      } else {
        toast({
          variant: "destructive",
          description: `Invalid email address: ${newOption.value}`,
        })
        setRecipients(newValue.slice(0, -1))
      }
    } else {
      setRecipients(newValue)
    }
  }

  const handleShareLink = async () => {
    if (recipients.length === 0) {
      toast({
        variant: "destructive",
        description: "Please add at least one recipient",
      })
      return
    }

    setIsSharing(true)
    try {
      if (!domain) {
        throw new Error("Failed to fetch domain information")
      }

      const emailRecipients = recipients
        .filter(
          (r): r is { value: string; label: string; isEmail: true } =>
            "isEmail" in r && r.isEmail
        )
        .map((r) => r.value)
      
      const groupRecipients = recipients.filter(
        (r): r is Group => !("isEmail" in r)
      ) as Group[]

      const selectedContactEmails = contacts
        .filter((contact) =>
          contact.groups.some((contactGroup) =>
            groupRecipients.some((sg) => sg.value === contactGroup.value)
          )
        )
        .map((contact) => contact.email)

      const to = Array.from(
        new Set([...emailRecipients, ...selectedContactEmails])
      )
        .map((email) => {
          const contact = contacts.find((c) => c.email === email)
          if (contact?.name) {
            return `${contact.name} <${email}>`
          } else {
            const name = email.split("@")[0]
            return `${name} <${email}>`
          }
        })
        .slice(0, 50)

      const requestData = {
        to,
        linkId: link.id,
        message: message || undefined,
        domainName: domain.domain_name,
        senderName: domain.sender_name,
      }

      clientLogger.info('Sending link email request', { 
        requestData,
        linkId: link.id,
        linkObject: link
      })

      const response = await fetch("/api/send-link-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        clientLogger.error('Error response', { errorData })
        throw new Error(errorData.error || "Failed to share link")
      }

      toast({
        description: "Link has been shared successfully",
      })

      // Reset form and close modal
      setRecipients([])
      setMessage("")
      onClose()

    } catch (error) {
      clientLogger.error('Error sharing link', { error })
      toast({
        variant: "destructive",
        description: `Failed to share link: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      })
    } finally {
      setIsSharing(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share Link</DialogTitle>
          <DialogDescription>
            Share &ldquo;{link.filename}&rdquo; with others via email
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label>To</Label>
            <CreatableSelect
              isMulti
              options={groups}
              value={recipients}
              onChange={handleRecipientChange}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Enter email addresses or select groups..."
              styles={selectStyles}
              components={customComponents}
              createOptionPosition="first"
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleShareLink}
              disabled={isSharing}
            >
              {isSharing ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Share Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}