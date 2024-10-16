"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MessageForm } from "@/components/message-form"
import { Database } from "@/types/supabase"
import { toast } from "./ui/use-toast"
import { useRouter } from "next/navigation"

type Contact = Database["public"]["Tables"]["contacts"]["Row"] & { groups: Group[] }
type User = Database["public"]["Tables"]["users"]["Row"]
type Domain = Database["public"]["Tables"]["domains"]["Row"]
type Group = { value: string; label: string; color: string }

type NewMessageButtonProps = {
  account: User;
  groups: Group[];
  contacts: Contact[];
  domain: Domain | null;
}

export function NewMessageButton({ account, groups, contacts, domain }: NewMessageButtonProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => {
        if (!domain) {
          toast({
            title: "Domain required",
            description:
              "Please add a domain to your account to start sending emails",
            action: (
              <Button
                variant="outline"
                onClick={() => router.push("/account?tab=domain")}
              >
                Account
              </Button>
            ),
          })
        } else {
          setIsDialogOpen(true)
        }
      }}>
        Get Started
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Compose and send a new message
            </DialogDescription>
          </DialogHeader>
          <MessageForm
            selectedContactEmail=""
            groups={groups}
            contacts={contacts}
            account={account}
            onClose={() => setIsDialogOpen(false)}
            domain={domain}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}