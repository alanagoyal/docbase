"use client"

import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import * as bcrypt from "bcryptjs"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Database } from "@/types/supabase"

const linkFormSchema = z.object({
  email: z
    .string({
      required_error: "Please enter a valid email",
    })
    .email(),
  password: z.string().optional(),
})

type Link = Database["public"]["Tables"]["links"]["Row"]
type LinkFormValues = z.infer<typeof linkFormSchema>
type User = Database["public"]["Tables"]["users"]["Row"]

export default function ViewLinkForm({ link, account }: { link: Link, account: User }) {
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      email: account?.email || "",
      password: "",
    },
  })
  const supabase = createClient()
  const passwordRequired = link?.password ? true : false

  async function onSubmit(data: LinkFormValues) {
    if (!link.url) {
      toast({
        description: "Link is not valid",
      })
      return
    }

    // Log viewer
    const updates = {
      link_id: link.id,
      email: data.email,
      viewed_at: new Date().toISOString(),
    }
    await supabase.from("viewers").insert(updates)

    if (passwordRequired) {
      // Check password
      if (!bcrypt.compareSync(data.password!, link.password!)) {
        toast({
          description: "Incorrect password",
        })
        return
      }
    }

    if (account) {
      // Redirect to the link URL if the user is already authenticated
      window.location.href = link.url
    } else {
      // Send magic link for unauthenticated users
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: link.url,
        },
      })

      if (error) {
        toast({
          title: "Failed to send magic link",
          description: error.message,
        })
      } else {
        toast({
          title: "Magic link sent to " + data.email,
          description: "Please click the link in your email to continue",
        })
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5 flex-grow">
                  <FormLabel htmlFor="email" className="text-base pr-2">
                    Email
                  </FormLabel>
                  <FormDescription className="pr-4">
                    {account
                      ? "Your email address will only be shared with the document owner"
                      : "Please enter your email to receive a magic link"}
                  </FormDescription>
                </div>
                <FormControl>
                  <Input
                    id="email"
                    className="w-[200px]"
                    {...field}
                    autoComplete="off"
                    disabled={!!account}
                    value={account?.email || field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {passwordRequired && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5 flex-grow">
                    <FormLabel htmlFor="password" className="text-base pr-2">
                      Password
                    </FormLabel>
                    <FormDescription className="pr-4">
                      Please enter the password to view this document
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      className="w-[200px]"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <div className="space-y-4">
            <Button type="submit" className="w-full">
              {account ? "View Document" : "Send Magic Link"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
