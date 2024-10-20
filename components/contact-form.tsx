"use client"

import React, { useState, useCallback } from 'react'
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "lucide-react"
import { useForm } from "react-hook-form"
import CreatableSelect from 'react-select/creatable'
import * as z from "zod"
import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { getColorForGroup } from "@/utils/group-colors"
import { v4 as uuidv4 } from 'uuid';

const memberFormSchema = z.object({
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  name: z.string().optional(),
  groups: z.array(z.object({ value: z.string(), label: z.string(), color: z.string() })),
})

type Contact = Database["public"]["Tables"]["contacts"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

type MemberFormValues = z.infer<typeof memberFormSchema>

type ContactFormProps = {
  existingContact?: Contact & { groups: { value: string, label: string, color: string }[] }
  account: User
  groups: { value: string, label: string, color: string }[]
  onSuccess?: () => void  
}

export function ContactForm({
  existingContact,
  account,
  groups,
  onSuccess,  
}: ContactFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const [localGroups, setLocalGroups] = useState(groups)
  const [selectedGroups, setSelectedGroups] = useState(existingContact?.groups || [])

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: existingContact?.email || "",
      name: existingContact?.name || "",
      groups: existingContact?.groups || [],
    },
  })

  const getNextColor = useCallback(() => {
    return getColorForGroup(localGroups.length);
  }, [localGroups]);

  const handleCreateGroup = async (inputValue: string) => {
    const newColor = getNextColor();
    const newGroupId = uuidv4();
    
    // Insert the new group into the database
    const { data: insertedGroup, error } = await supabase
      .from("groups")
      .insert({ id: newGroupId, name: inputValue, color: newColor, created_by: account.id })
      .select()
      .single();

    if (error) {
      console.error("Error creating group:", error);
      toast({
        description: "Failed to create new group. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    const newGroup = { 
      value: insertedGroup.id,
      label: inputValue, 
      color: newColor 
    };
    const updatedGroups = [...localGroups, newGroup];
    setLocalGroups(updatedGroups);
    
    // Update the selected groups
    const updatedSelectedGroups = [...selectedGroups, newGroup];
    setSelectedGroups(updatedSelectedGroups);
    
    // Update the form value
    form.setValue('groups', updatedSelectedGroups);
    
    return newGroup;
  }

  const customComponents = {
    MultiValue: ({ children, removeProps, ...props }: any) => {
      return (
        <Badge
          className="flex items-center gap-1 m-1"
          style={{
            backgroundColor: props.data.color,
            color: 'white',
          }}
        >
          {children}
          <span {...removeProps} className="cursor-pointer hover:opacity-75">
            <X size={14} />
          </span>
        </Badge>
      );
    },
  };

  async function onSubmit(data: MemberFormValues) {
    try {
      setIsLoading(true)
      const updates = {
        email: data.email,
        name: data.name,
        created_by: account.id,
        updated_at: new Date().toISOString(),
      }

      let contactId: string

      if (existingContact) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from("contacts")
          .update(updates)
          .eq("id", existingContact.id)
        if (updateError) throw updateError
        contactId = existingContact.id
      } else {
        // Create new contact
        const { data: insertedContact, error: insertError } = await supabase
          .from("contacts")
          .insert([updates])
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

      toast({
        description: existingContact
          ? "Contact updated successfully"
          : "New contact added",
      })
      if (onSuccess) onSuccess() 
      router.refresh()
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="off" {...field} />
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
                <Input autoComplete="off" {...field} />
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
                  options={localGroups}
                  value={selectedGroups}
                  onChange={(newValue) => {
                    setSelectedGroups(newValue as any);
                    field.onChange(newValue);
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onCreateOption={handleCreateGroup}
                  isDisabled={isLoading}
                  styles={selectStyles}
                  components={customComponents}
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
  )
}