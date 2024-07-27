"use client"

import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

const accountFormSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
})

type User = Database["public"]["Tables"]["users"]["Row"]
type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountForm({ account }: { account: User }) {
  const supabase = createClient()
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: account.email || "",
      name: account.name || "",
    },
  })

  async function onSubmit(data: AccountFormValues) {
    try {
      const updates = {
        email: data.email,
        name: data.name,
      }

      let { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", account.id)
      if (error) throw error
      toast({
        description: "Your account has been updated",
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Make changes to your profile information here
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
            >
              Update
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}