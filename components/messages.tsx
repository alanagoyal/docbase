"use client"

import { useState, useEffect, useCallback } from "react"
import { Mail, X, Plus } from "lucide-react"
import { SafeHtml } from "./safe-html"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MessageForm } from "./message-form"
import { Button } from "./ui/button"
import { Database } from "@/types/supabase"
import { useDomainCheck } from "@/hooks/use-domain-check"
import { createClient } from "@/utils/supabase/client"
import { toast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { isTyping } from "@/utils/is-typing"
import Link from 'next/link'
import { clientLogger } from "@/lib/client-logger"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type Contact = Database["public"]["Tables"]["contacts"]["Row"] & { groups: Group[] }
type User = Database["public"]["Tables"]["users"]["Row"]
type Domain = Database["public"]["Tables"]["domains"]["Row"]
type Group = { value: string; label: string; color: string }

export function MessagesTable({
  messages,
  groups,
  contacts,
  account,
  domain,
}: {
  messages: Message[]
  groups: Group[]
  contacts: Contact[]
  account: User
  domain: Domain | null
}) {
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const checkDomain = useDomainCheck(domain)
  const supabase = createClient()
  const router = useRouter()
  
  const formatRecipients = (recipients: string) => {
    const emailToContact = new Map(contacts.map(contact => [contact.email, contact]));
    return recipients
      .split(', ')
      .map(recipient => {
        const email = recipient.match(/<(.+)>/)?.[1] || recipient;
        const contact = emailToContact.get(email);
        if (contact) {
          return (
            <Link
              key={contact.id}
              href={`/contacts?contactId=${contact.id}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/contacts?contactId=${contact.id}`);
              }}
              className="hover:underline cursor-pointer"
            >
              {contact.name}
            </Link>
          );
        }
        return recipient.split(' <')[0];
      })
      .reduce((prev, curr, i) => {
        return i === 0 ? [curr] : [...prev, ', ', curr];
      }, [] as React.ReactNode[]);
  };

  const handleNewMessage = () => {
    checkDomain(() => setIsNewMessageDialogOpen(true))
  }

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      clientLogger.error('Error deleting message', { error })
      toast({
        variant: 'destructive',
        title: 'Failed to delete message',
        description: error.message,
      })
    } else {
      toast({
        description: 'Message deleted successfully',
      })
      // Reset selection after successful deletion
      setSelectedMessage(null)
      setSelectedIndex(null)
      router.refresh()
    }
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && selectedMessage) {
      setSelectedMessage(null)
      setSelectedIndex(null)
    } else if (event.key === 'p' && hoveredMessageId) {
      const index = messages.findIndex(m => m.id === hoveredMessageId)
      if (index !== -1) {
        setSelectedMessage(messages[index])
        setSelectedIndex(index)
      }
    } else if (selectedMessage) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault() // Prevent default scrolling
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null) return 0
          const newIndex = event.key === 'ArrowDown'
            ? (prevIndex + 1) % messages.length
            : (prevIndex - 1 + messages.length) % messages.length
          return newIndex
        })
      }
    }
    if (event.key === 'd' && hoveredMessageId) {
      event.preventDefault()
      setMessageToDelete(hoveredMessageId)
      setIsDeleteDialogOpen(true)
    }
  }, [selectedMessage, hoveredMessageId, messages])

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < messages.length) {
      setSelectedMessage(messages[selectedIndex])
      // Scroll the selected message into view
      const messageElement = document.getElementById(`message-${messages[selectedIndex].id}`)
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } else {
      // Reset selection if the index is invalid
      setSelectedMessage(null)
      setSelectedIndex(null)
    }
  }, [selectedIndex, messages])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && !isTyping()) {
        e.preventDefault()
        checkDomain(() => setIsNewMessageDialogOpen(true))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [checkDomain])

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`flex flex-col ${selectedMessage ? 'w-1/2 border-r' : 'w-full'}`}>
        <div className="p-4 pt-10 border-b flex justify-between items-center flex-shrink-0">
          {selectedMessage ? (
            <h1 className="text-2xl font-semibold">Messages</h1>
          ) : (
            <>
              <div className="w-[150px]"></div>
              <h1 className="text-2xl font-semibold flex-grow text-center">Messages</h1>
            </>
          )}
          <Button
            variant="ghost"
            className="w-[150px]"
            onClick={handleNewMessage}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">New</span>
          </Button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {messages.map((message, index) => (
            <div
              key={message.id}
              id={`message-${message.id}`}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedIndex === index ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message)
                setSelectedIndex(index)
              }}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
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
                <SafeHtml html={message.body} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedMessage && (
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
            <button 
              onClick={() => setSelectedMessage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-grow">
            <div className="flex items-center mb-4">
              <span className="font-medium mr-2">
                {formatRecipients(selectedMessage.recipient)}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(selectedMessage.created_at).toLocaleString()}
              </span>
            </div>
            <SafeHtml html={selectedMessage.body} />
          </div>
        </div>
      )}
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
            domain={domain}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (messageToDelete) {
                deleteMessage(messageToDelete)
                setMessageToDelete(null)
              }
              setIsDeleteDialogOpen(false)
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
