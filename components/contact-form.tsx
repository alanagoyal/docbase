"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, User } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

import { Icons } from "./icons"

const memberFormSchema = z.object({
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  name: z.string().optional(),
})

type Contact = Database["public"]["Tables"]["contacts"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]
type MemberFormValues = z.infer<typeof memberFormSchema>

export default function ContactForm({
  existingContact,
  account,
  isOpen,
  onOpenChange,
}: {
  existingContact?: Contact
  account: User
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: existingContact?.email || "",
      name: existingContact?.name || "",
    },
  })

  async function onSubmit(data: MemberFormValues) {
    try {
      setIsLoading(true)
      const memberUpdates = {
        email: data.email,
        name: data.name,
        created_by: account.auth_id,
      }

      if (existingContact) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from("contacts")
          .update(memberUpdates)
          .eq("id", existingContact.id)
        if (updateError) throw updateError
      } else {
        // Create new contact
        const { error: insertError } = await supabase
          .from("contacts")
          .insert([memberUpdates])
        if (insertError) throw insertError
      }

      form.reset()
      toast({
        description: existingContact
          ? "Contact updated successfully"
          : "New contact added",
      })
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding/updating contact:", error)
      toast({
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>
          {existingContact ? "Edit Contact" : "New Contact"}
        </DialogTitle>
        <DialogDescription>
          {existingContact
            ? "Edit contact details"
            : "Add the name and email address of the contact"}
        </DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              {isLoading ? (
                <Icons.spinner className="w-4 h-4 animate-spin" />
              ) : existingContact ? (
                "Update Contact"
              ) : (
                "Add Contact"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
