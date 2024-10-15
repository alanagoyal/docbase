"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { StyledQuillEditor } from "./quill-editor"
import { Icons } from "./icons"
import { toast } from "./ui/use-toast"
import CreatableSelect from "react-select/creatable"
import { selectStyles } from "@/utils/select-styles"
import { Badge } from "./ui/badge"
import { X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Database } from "@/types/supabase"
import "react-quill/dist/quill.snow.css"
import "@/styles/quill-custom.css"
import { useRouter } from "next/navigation"

type Group = { value: string; label: string; color: string }

type Contact = Database["public"]["Tables"]["contacts"]["Row"] & { groups: Group[] }

interface NewMessageProps {
  selectedContactEmail: string
  groups: Group[]
  contacts: Contact[]
  account: any
  onClose: () => void
}

export function MessageForm({
  selectedContactEmail,
  groups,
  contacts,
  account,
  onClose,
}: NewMessageProps) {
  const supabase = createClient()
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([])
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const customComponents = {
    MultiValue: ({ children, removeProps, ...props }: any) => {
      return (
        <Badge
          className="flex items-center gap-1 m-1"
          style={{
            backgroundColor: props.data.color,
            color: "white",
          }}
        >
          {children}
          <span {...removeProps} className="cursor-pointer hover:opacity-75">
            <X size={14} />
          </span>
        </Badge>
      )
    },
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
    setIsSendingEmail(true);
    try {
      const domainInfo = await fetchDomainInfo(account.id);
      if (!domainInfo) {
        throw new Error("Failed to fetch domain information");
      }

      let to;
      if (selectedContactEmail) {
        to = selectedContactEmail;
      } else {
        const selectedContactEmails = contacts
          .filter((contact) =>
            contact.groups.some((contactGroup) =>
              selectedGroups.some((sg) => sg.value === contactGroup.value)
            )
          )
          .map((contact) => contact.email);

        to = selectedContactEmails
          .map((email) => {
            const contact = contacts.find((c) => c.email === email);
            return contact?.name ? `${contact.name} <${email}>` : email;
          })
          .slice(0, 50);
      }

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
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to send email");
      }

      // Add message to the database
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: account.id,
          recipient: Array.isArray(to) ? to.join(', ') : to,
          subject,
          body,
          status: 'sent'
        })
        .select();

      if (messageError) {
        console.error("Error inserting message into database:", messageError);
        throw new Error("Failed to save message in database");
      }

      if (!messageData || messageData.length === 0) {
        throw new Error("No data returned after inserting message");
      }

      // Update user's messages array
      const newMessageId = messageData[0].id;
      const { error: userUpdateError } = await supabase
        .rpc('append_message_to_user', {
          user_id: account.id,
          message_id: newMessageId
        });

      if (userUpdateError) {
        console.error("Error updating user's messages array:", userUpdateError);
        // Consider whether you want to throw an error here or just log it
      }

      toast({
        description: "Your message has been sent",
      });

      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        variant: "destructive",
        description: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSendingEmail(false);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-grow">
      {!selectedContactEmail && (
        <div className="space-y-2">
          <Label>To</Label>
          <CreatableSelect
            isMulti
            options={groups}
            value={selectedGroups}
            onChange={(newValue) => setSelectedGroups(newValue as Group[])}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select groups..."
            styles={selectStyles}
            components={customComponents}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="space-y-2 flex-grow">
        <Label>Body</Label>
        <StyledQuillEditor
          value={body}
          onChange={setBody}
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
  )
}
