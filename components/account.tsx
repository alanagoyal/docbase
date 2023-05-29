"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useSupabase } from "@/app/supabase-provider"

const accountFormSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountForm({
  user,
  name,
  email,
}: {
  user: string
  name: string
  email: string
}) {
  const { supabase } = useSupabase()
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: email || "",
      name: name || "",
    },
  })

  async function onSubmit(data: AccountFormValues) {
    try {
      const updates = {
        email: email,
        full_name: data.name,
      }

      let { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user)
      if (error) throw error
      toast({
        description: "Your profile has been updated",
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <Input {...field} disabled />
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
              className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
            >
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
