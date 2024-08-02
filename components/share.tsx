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
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { FormItem, FormLabel } from "./ui/form"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { toast } from "./ui/use-toast"

export function Share({
  investmentId,
  onEmailSent,
}: {
  investmentId: string
  onEmailSent: () => void
}) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
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

  async function sendEmail() {
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
      .upsert({ name, email }, { onConflict: "email" })
      .select("id")
      .single()

    if (founderError) throw founderError

    // Update investment with founder_id
    const updateResponse = await supabase
      .from("investments")
      .update({ founder_id: founderData.id })
      .eq("id", investmentId)

    const body = {
      name,
      email,
      url: idString,
      investor: investmentData?.investor_id,
      fund: investmentData?.fund_id,
    }

    try {
      const response = await fetch("/send-form-email", {
        method: "POST",
        body: JSON.stringify(body),
      })
      toast({
        title: "Email sent",
        description: `The email has been sent to ${email}`,
      })
      setIsOpen(false)
      onEmailSent()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <span className="text-sm">Share</span>
          <Icons.share className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
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
              <CardContent className="flex flex-col space-y-2">
                <FormItem>
                  <FormLabel>Founder Name</FormLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Founder Email</FormLabel>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                </FormItem>
                <Button
                  className="w-full"
                  onClick={sendEmail}
                  disabled={isSending}
                >
                  {isSending ? <Icons.spinner /> : "Send Email"}
                </Button>
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
