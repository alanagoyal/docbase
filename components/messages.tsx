"use client"

import { useState } from "react"
import { Mail, X, Plus } from "lucide-react"
import { SafeHtml } from "./safe-html"
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
import { Database } from "@/types/supabase"

type Message = Database['public']['Tables']['messages']['Row']

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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const formatRecipients = (recipients: string) => {
    return recipients
      .split(', ')
      .map(recipient => recipient.split(' <')[0])
      .join(', ');
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex">
          <div className={`${selectedMessage ? 'w-1/2 border-r' : 'w-full'} flex flex-col`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Messages</h1>
              <Button
                variant="ghost"
                onClick={() => setIsNewMessageDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline-block ml-2">New</span>
              </Button>
            </div>
            <div className="overflow-auto flex-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{message.subject}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{formatRecipients(message.recipient)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    <SafeHtml html={message.body.slice(0, 100)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selectedMessage && (
            <div className="w-1/2 flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 overflow-auto flex-1">
                <div className="flex items-center mb-4">
                  <span className="font-medium mr-2">{formatRecipients(selectedMessage.recipient)}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>
                <SafeHtml html={selectedMessage.body} />
              </div>
            </div>
          )}
        </main>
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
