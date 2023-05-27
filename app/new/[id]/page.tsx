"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

import { useSupabase } from "../../supabase-provider"

const linkFormSchema = z.object({
  password: z.string().optional(),
  expires: z.date({ required_error: "Please enter a valid date" }),
})

type LinkFormValues = z.infer<typeof linkFormSchema>

const defaultValues: Partial<LinkFormValues> = {
  password: "",
  expires: new Date(),
}

type Links = Database["public"]["Tables"]["links"]["Row"]

export default function LinkForm({ params }: { params: { id: string } }) {
  const id = params.id
  const { supabase } = useSupabase()
  const [filePath, setFilePath] = useState<string>("")
  const [url, setUrl] = useState<Links["url"]>("")
  const [user, setUser] = useState<any>("")
  const { toast } = useToast()
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues,
  })
  const router = useRouter()
  const [protectWithPassword, setProtectWithPassword] = useState<boolean>(true)
  const [protectWithExpiration, setProtectWithExpiration] =
    useState<boolean>(true)
  const [linkData, setLinkData] = useState<any>(null)

  useEffect(() => {
    getUser()
    getLink()
  }, [])

  async function getLink() {
    const { data: link, error } = await supabase
      .from("links")
      .select("*")
      .eq("id", id)
      .single()

    setLinkData(link)
    console.log(link)
  }

  async function getUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user.id || "")
    if (!session) {
      router.push("/")
    }
  }

  function onSubmit(data: LinkFormValues) {
    if (data) {
      // get from data
      createLink({
        filePath,
        data,
      })
    }
  }

  async function createLink({
    filePath,
    data,
  }: {
    filePath: string
    data: LinkFormValues
  }) {
    try {
      // compute expiration in seconds
      const selectedDate = new Date(data.expires!)
      const currentDate = new Date()

      const millisecondsUntilExpiration =
        selectedDate.getTime() - currentDate.getTime()
      const secondsUntilExpiration = Math.floor(
        millisecondsUntilExpiration / 1000
      )

      // create url
      const { data: signedUrlData } = await supabase.storage
        .from("docs")
        .createSignedUrl(filePath, secondsUntilExpiration)

      console.log(signedUrlData?.signedUrl)
      const updates = {
        user_id: user,
        url: signedUrlData?.signedUrl,
        password: data.password,
        expires: data.expires.toISOString(),
        filename: filePath,
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
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base pr-2">
                Password Protected
              </FormLabel>
              <FormDescription className="pr-4">
                Viewers must enter this password to view your document
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={protectWithPassword}
                onCheckedChange={setProtectWithPassword}
              />
            </FormControl>
          </FormItem>
          {protectWithPassword && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base pr-2">Password</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base pr-2">
                Set Expiration Date
              </FormLabel>
              <FormDescription className="pr-4">
                Viewers will no longer be able to access your link after this
                date{" "}
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={protectWithExpiration}
                onCheckedChange={setProtectWithExpiration}
              />
            </FormControl>
          </FormItem>
          {protectWithExpiration && (
            <FormField
              control={form.control}
              name="expires"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className="text-base pr-2">Expires</FormLabel>
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
                        className="w-full"
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date("2900-01-01") ||
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="pr-4">
                    Viewers will no longer be able to access your link after
                    this date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Doc
            uid={user}
            url={url}
            onUpload={(filePath) => {
              setFilePath(filePath)
            }}
          />
          <Button
            className="bg-[#9FACE6] text-white font-bold  px-4 rounded w-full"
            type="submit"
          >
            Create Link
          </Button>
        </form>
      </Form>
    </div>
  )
}
