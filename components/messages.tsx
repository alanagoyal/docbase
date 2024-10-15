"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { MessageForm } from "./message-form"
import { Button } from "./ui/button"

type Message = {
  id: string
  subject: string
  recipient: string
  created_at: string
  status: string
}

export function MessagesTable({
  messages,
  groups,
  contacts,
  account,
}: {
  messages: Message[]
  groups: any[]
  contacts: any[]
  account: any
}) {
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center max-w-5xl mx-auto py-4 relative">
        <div className="w-[150px]" />
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          Messages
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className="w-[150px]"
            onClick={() => setIsNewMessageDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">New</span>
          </Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="container mx-auto py-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>{message.recipient}</TableCell>
                  <TableCell>
                    {new Date(message.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{message.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Dialog
        open={isNewMessageDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsNewMessageDialogOpen(false)
          }
        }}
      >
        <DialogContent className="flex flex-col max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Compose and send a new email to selected groups
            </DialogDescription>
          </DialogHeader>
          <MessageForm
            selectedContactEmail=""
            groups={groups}
            contacts={contacts}
            account={account}
            onClose={() => setIsNewMessageDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
