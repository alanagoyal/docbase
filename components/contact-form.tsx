"use client"

import React from 'react'
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "lucide-react"
import { useForm } from "react-hook-form"
import CreatableSelect from 'react-select/creatable'
import * as z from "zod"
import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "./icons"
import { useRouter } from 'next/navigation'
import { selectStyles } from '@/utils/select-styles'

const memberFormSchema = z.object({
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  name: z.string().optional(),
  groups: z.array(z.object({ value: z.string(), label: z.string() })),
})

type Contact = Database["public"]["Tables"]["contacts"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

type MemberFormValues = z.infer<typeof memberFormSchema>

type ContactFormProps = {
  existingContact?: Contact & { groups: { value: string, label: string }[] }
  account: User
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  groups: { value: string, label: string }[]
}

export default function ContactForm({
  existingContact,
  account,
  isOpen,
  onOpenChange,
  groups,
}: ContactFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: existingContact?.email || "",
      name: existingContact?.name || "",
      groups: existingContact?.groups || [],
    },
  })

  const handleCreateGroup = async (inputValue: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({ name: inputValue, created_by: account.auth_id })
        .select()
      if (error) throw error
      
      const newGroup = { value: data[0].id, label: data[0].name }
      form.setValue('groups', [...form.getValues('groups'), newGroup])
      return newGroup
    } catch (error) {
      console.error('Error creating new group:', error)
      toast({
        description: "Failed to create new group. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: MemberFormValues) {
    try {
      setIsLoading(true)
      const memberUpdates = {
        email: data.email,
        name: data.name,
        created_by: account.auth_id,
      }

      let contactId: string

      if (existingContact) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from("contacts")
          .update(memberUpdates)
          .eq("id", existingContact.id)
        if (updateError) throw updateError
        contactId = existingContact.id
      } else {
        // Create new contact
        const { data: insertedContact, error: insertError } = await supabase
          .from("contacts")
          .insert([memberUpdates])
          .select()
        if (insertError) throw insertError
        contactId = insertedContact[0].id
      }

      // Update contact groups
      await supabase
        .from("contact_groups")
        .delete()
        .eq("contact_id", contactId)

      if (data.groups.length > 0) {
        const contactGroups = data.groups.map((group) => ({
          contact_id: contactId,
          group_id: group.value,
        }))
        const { error: groupInsertError } = await supabase
          .from("contact_groups")
          .insert(contactGroups)
        if (groupInsertError) throw groupInsertError
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
      <DialogContent className="sm:max-w-[425px] overflow-visible">
        <DialogHeader>
          <DialogTitle>
            {existingContact ? "Edit Contact" : "New Contact"}
          </DialogTitle>
          <DialogDescription>
            {existingContact
              ? "Edit contact details"
              : "Add the name and email address of the contact"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
            <FormField
              control={form.control}
              name="groups"
              render={({ field }) => (
                <FormItem className="overflow-visible">
                  <FormLabel>Groups</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      {...field}
                      isMulti
                      options={groups}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onCreateOption={handleCreateGroup}
                      isDisabled={isLoading}
                      styles={selectStyles}
                    />
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