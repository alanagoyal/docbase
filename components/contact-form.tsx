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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
}: {
  existingContact?: Contact
  account: User
}) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = React.useState(false)
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
      setOpen(false)
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
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-[150px]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">
              {" "}
              {existingContact ? "Edit Contact" : "New Contact"}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {existingContact ? "Edit Contact" : "New Contact"}
            </DialogTitle>
            <DialogDescription>
              {existingContact
                ? "Edit contact details"
                : "Please enter contact details"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {" "}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base mx-2">Email</FormLabel>
                      </div>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base mx-2">Name</FormLabel>
                      </div>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="py-1 flex justify-center">
                  <Button
                    type="submit"
                    onClick={() => {
                      setOpen(false)
                    }}
                    className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
                  >
                    {isLoading ? (
                      <Icons.spinner className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
