"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import Doc from "@/components/doc"

import { useSupabase } from "../supabase-provider"

const linkFormSchema = z.object({
  password: z.string().optional(),
  emailProtected: z.boolean().optional(),
  expires: z.date({ required_error: "Please enter a valid date" }),
})

type LinkFormValues = z.infer<typeof linkFormSchema>

const defaultValues: Partial<LinkFormValues> = {
  password: "",
  emailProtected: true,
  expires: new Date(Number.MAX_VALUE),
}

type Links = Database["public"]["Tables"]["links"]["Row"]

export default function LinkForm() {
  const { supabase } = useSupabase()
  const [userId, setUserId] = useState<Links["user_id"]>("")
  const [filePath, setFilePath] = useState<string>("")
  const [url, setUrl] = useState<Links["url"]>("")
  const [password, setPassword] = useState<Links["password"]>(null)
  const [emailProtected, setEmailProtected] =
    useState<Links["email_protected"]>(false)
  const [expires, setExpires] = useState<Links["expires"]>(
    new Date().toISOString()
  )
  const [downloadEnabled, setDownloadEnabled] =
    useState<Links["download_enabled"]>(false)
  const [editsEnabled, setEditsEnabled] =
    useState<Links["edits_enabled"]>(false)
  const [user, setUser] = useState<any>("")
  const { toast } = useToast()
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues,
  })

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user.id || "")
  }

  function onSubmit(data: LinkFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  async function createLink({
    filePath,
    password,
    emailProtected,
    expires,
    downloadEnabled,
    editsEnabled,
  }: {
    filePath: string
    password: Links["password"]
    emailProtected: Links["email_protected"]
    expires: Links["expires"]
    downloadEnabled: Links["download_enabled"]
    editsEnabled: Links["edits_enabled"]
  }) {
    try {
      // compute expiration in seconds
      const selectedDate = new Date(expires!)
      const currentDate = new Date()

      const millisecondsUntilExpiration =
        selectedDate.getTime() - currentDate.getTime()
      const secondsUntilExpiration = Math.floor(
        millisecondsUntilExpiration / 1000
      )

      // create url
      const { data } = await supabase.storage
        .from("docs")
        .createSignedUrl(filePath, secondsUntilExpiration)

      const updates = {
        user_id: user,
        url: data?.signedUrl,
        password: password,
        email_protected: emailProtected,
        expires: expires,
        download_enabled: downloadEnabled,
        edits_enabled: editsEnabled,
      }

      let { data: link, error } = await supabase
        .from("links")
        .insert(updates)
        .select("id")
        .single()
      if (error) throw error

      toast({
        description: "Your link has been created successfully",
        action: (
          <Link href={`/docs/${link?.id}`}>
            <ToastAction altText="Try again">Visit</ToastAction>
          </Link>
        ),
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">New Link</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="emailProtected"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Protected</FormLabel>
                  <FormDescription>
                    Viewers must enter an email to view your document
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expires"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expires</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Your date of birth is used to calculate your age.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div>
        <div>
          <Label htmlFor="expires">Expiration Date</Label>
          <Input
            id="expires"
            type="date"
            value={expires || ""}
            className="h-10 p-1"
            onChange={(e) => setExpires(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="emailProtected">Email Protected</Label>
          <Switch
            checked={emailProtected!}
            onCheckedChange={setEmailProtected}
          />
        </div>
        <div>
          <Label htmlFor="password">Password (Optional)</Label>
          <Input
            id="password"
            type="password"
            value={password || ""}
            className="h-10 p-1"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="pt-1">
          <div className="py-1">
            <Doc
              uid={user}
              url={url}
              size={150}
              onUpload={(filePath) => {
                setFilePath(filePath)
              }}
            />
          </div>
          <div className="py-1">
            <Button
              type="submit"
              className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
              onClick={() =>
                createLink({
                  filePath,
                  password,
                  emailProtected,
                  expires,
                  downloadEnabled,
                  editsEnabled,
                })
              }
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
