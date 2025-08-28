"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon } from "lucide-react"
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { clientLogger } from "@/lib/client-logger"

const domainFormSchema = z.object({
  domainName: z.string().min(1, "Domain name is required"),
  apiKey: z.string().min(1, "API key is required"),
  senderName: z.string().min(1, "Sender name is required"),
})

type DomainFormValues = z.infer<typeof domainFormSchema>
type User = Database["public"]["Tables"]["users"]["Row"]
type Domain = Database["public"]["Tables"]["domains"]["Row"]

export default function DomainForm({
  account,
  domain,
}: {
  account: User
  domain: Domain | null
}) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domainName: domain?.domain_name || "",
      apiKey: domain?.api_key || "",
      senderName: domain?.sender_name || "",
    },
  })

  const onSubmit = async (data: DomainFormValues) => {
    setIsLoading(true)
    try {
      let domainId = domain?.id

      // Check if the domain name is being changed
      if (!domain || data.domainName !== domain.domain_name) {
        // Create the domain using the Resend API only if it's new or the name has changed
        const response = await fetch("/api/create-domain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.error) {
          throw new Error(result.error || "Failed to create domain")
        }

        if (!result.id) {
          throw new Error("Invalid domain data received from API")
        }

        domainId = result.id
      }

      // Update or insert the domain in the database
      const { error } = domain
        ? await supabase
            .from("domains")
            .update({
              domain_name: data.domainName,
              sender_name: data.senderName,
              api_key: data.apiKey,
            })
            .eq("id", domain.id)
        : await supabase.from("domains").insert({
            id: domainId,
            created_at: new Date().toISOString(),
            domain_name: data.domainName,
            user_id: account.id,
            sender_name: data.senderName,
            api_key: data.apiKey,
          })

      if (error) {
        throw error
      }

      toast({
        title: domain ? "Domain updated" : "Domain created and saved",
        description: domain
          ? "Your domain has been successfully updated."
          : "Your domain has been successfully created and saved to your profile.",
      })
    } catch (error) {
      clientLogger.error('Error creating/updating domain', { error })
      toast({
        title: "Error creating domain",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Settings</CardTitle>
        <CardDescription>
          {domain
            ? "Update your domain settings"
            : "Configure your domain for sending emails"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="domainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the domain name you want to use for sending emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the name you want to use for sending emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center space-x-2">
                      <span>API Key</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs font-normal">
                              Docbase uses{" "}
                              <a
                                href="https://www.resend.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Resend
                              </a>{" "}
                              to power emails from the platform. Please sign up
                              for an account, grab your API key, and paste it
                              here to start sending emails from your domain.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>Enter your Resend API key</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : domain
                ? "Update Domain"
                : "Create Domain"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
