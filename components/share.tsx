"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Icons } from "./icons"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl } from "./ui/form"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { toast } from "./ui/use-toast"
import { useForm } from "react-hook-form"

export function Share({
  investmentId,
  onEmailSent,
  isOpen,
  onOpenChange,
}: {
  investmentId: string
  onEmailSent: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
  })
  const [isSending, setIsSending] = useState(false)
  const idString =
    typeof window !== "undefined"
      ? `${window.location.origin}/investments/new?id=${investmentId}&step=2&sharing=true`
      : ""
  const supabase = createClient()

  const handleCopy = () => {
    navigator.clipboard
      .writeText(idString)
      .then(() => {
        toast({
          description: "Copied to clipboard",
        })
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          description: "Unable to copy to clipboard",
        })
        console.error("Unable to copy text: ", err)
      })
  }

  async function onSubmit(values: { name: string; email: string }) {
    setIsSending(true)
    const { data: investmentData, error: investmentError } = await supabase
      .from("investments")
      .select(
        `
        investor_id (
          name,
          title,
          email
        ),
        fund_id (
          name,
          byline,
          street,
          city_state_zip
        )
      `
      )
      .eq("id", investmentId)
      .single()

    if (investmentError) throw investmentError

    // Upsert founder information
    const { data: founderData, error: founderError } = await supabase
      .from("users")
      .upsert({ name: values.name, email: values.email }, { onConflict: "email" })
      .select("id")
      .single()

    if (founderError) throw founderError

    // Update investment with founder_id
    const updateResponse = await supabase
      .from("investments")
      .update({ founder_id: founderData.id })
      .eq("id", investmentId)

    const body = {
      name: values.name,
      email: values.email,
      url: idString,
      investor: investmentData?.investor_id,
      fund: investmentData?.fund_id,
    }

    try {
      const response = await fetch("/api/send-form-email", {
        method: "POST",
        body: JSON.stringify(body),
      })
      toast({
        title: "Email sent",
        description: `The email has been sent to ${values.email}`,
      })
      onOpenChange(false)
      onEmailSent()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="sr-only">Request Founder Information</DialogTitle>
        <DialogDescription className="sr-only">
          Share investment details with a founder via email or link
        </DialogDescription>
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Request Founder Information
          </h1>
        </div>
        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="link">Share Link</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Email
                </CardTitle>
                <CardDescription>
                  Enter the name and email of the founder to send them this form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founder Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founder Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSending}
                    >
                      {isSending ? <Icons.spinner /> : "Send Email"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="link">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Share Link
                </CardTitle>
                <CardDescription>
                  Share this link to request the company details from the
                  founder
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center space-x-2 pt-2">
                <Input
                  id="link"
                  defaultValue={idString}
                  readOnly
                  className="h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  onClick={handleCopy}
                  className="px-3"
                >
                  <span className="sr-only">Copy</span>
                  <Icons.copy className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}