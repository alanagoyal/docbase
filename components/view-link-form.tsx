"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import * as bcrypt from "bcryptjs"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Database } from "@/types/supabase"
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

export default function ViewLinkForm({
  link,
  account,
}: {
  link: Link
  account: User
}) {
  const router = useRouter()
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      email: account?.email || "",
      password: "",
    },
  })
  const supabase = createClient()
  const passwordRequired = !!link?.password
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (account && link.url) {
      const duration = 2000 // 2 seconds
      const interval = 20 // Update every 20ms for smooth animation
      const incrementPerInterval = 100 / (duration / interval)

      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + incrementPerInterval
          return newProgress >= 100 ? 100 : newProgress
        })
      }, interval)

      const openLinkTimer = setTimeout(() => {
        if (link.url) {
          window.open(link.url, "_blank")
        } else {
          console.error("Link URL is null")
        }
      }, duration)

      return () => {
        clearInterval(timer)
        clearTimeout(openLinkTimer)
      }
    }
  }, [account, link.url])

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
      if (
        !data.password ||
        !link.password ||
        !bcrypt.compareSync(data.password, link.password)
      ) {
        toast({
          description: "Incorrect password",
        })
        return
      }
    }

    if (account) {
      // Open the link URL in a new tab if the user is already authenticated
      window.open(link.url, "_blank")
    } else {
      // Send magic link for unauthenticated users
      try {
        console.log("Sending magic link request:", {
          email: data.email,
          linkId: link.id,
        })
        const response = await fetch("/api/send-view-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email, linkId: link.id }),
        })

        console.log("Magic link response status:", response.status)
        const result = await response.json()
        console.log("Magic link response data:", result)

        if (!response.ok) {
          throw new Error(result.error || "Failed to send magic link")
        }

        toast({
          title: "Magic link sent to " + data.email,
          description: "Please click the link in your email to continue",
        })
      } catch (error: any) {
        console.error("Error sending magic link:", error)
        toast({
          title: "Failed to send magic link",
          description: error.message,
        })
      }
    }
  }

  if (account) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-[80vh]">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Opening Your Document
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we authenticate and prepare your document. It will
            open in a new tab or begin downloading shortly.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
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
                    value={field.value}
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
