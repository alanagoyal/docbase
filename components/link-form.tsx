"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { PopoverTrigger } from "@radix-ui/react-popover"
import * as bcrypt from "bcryptjs"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { useSupabase } from "@/app/supabase-provider"

import Doc from "./doc"
import { Popover, PopoverContent } from "./ui/popover"
import { Switch } from "./ui/switch"
import { ToastAction } from "./ui/toast"
import { toast } from "./ui/use-toast"

const linkFormSchema = z.object({
  protectWithPassword: z.boolean(),
  protectWithExpiration: z.boolean(),
  password: z.string().optional(),
  expires: z.date({ required_error: "Please enter a valid date" }),
})

type LinkFormValues = z.infer<typeof linkFormSchema>

export default function LinkForm({ link, user }: { link: any; user: any }) {
  const { supabase } = useSupabase()
  const [filePath, setFilePath] = useState<string>("")
  const [protectWithPassword, setProtectWithPassword] = useState<boolean>(false)
  const [protectWithExpiration, setProtectWithExpiration] =
    useState<boolean>(true)
  console.log(link)
  console.log(user)
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),

    defaultValues: {
      protectWithPassword: link?.password || false,
      protectWithExpiration: link?.expires || false,
      password: link?.password || "",
      expires:
        (link?.expires && new Date(link?.expires)) ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  function onSubmit(data: LinkFormValues) {
    console.log("onSubmit")
    if (data && filePath) {
      // get from data
      createLink({
        filePath,
        data,
      })
    } else {
      console.log("Error with filename")
    }
  }

  async function createUrl({
    filePath,
    data,
  }: {
    filePath: string
    data: LinkFormValues
  }) {
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

    return signedUrlData?.signedUrl
  }

  async function createLink({
    filePath,
    data,
  }: {
    filePath: string
    data: LinkFormValues
  }) {
    try {
      const passwordHash = bcrypt.hashSync(data.password!, 10)

      const signedUrl = await createUrl({ filePath, data })

      const updates = {
        user_id: user.id,
        url: signedUrl,
        password: passwordHash,
        expires: data.expires.toISOString(),
        filename: filePath,
      }
      let { data: link, error } = await supabase
        .from("links")
        .upsert(updates)
        .select("id")
        .single()
      if (error) throw error

      toast({
        description: "Your link has been created successfully",
        action: (
          <Link href={`/view/${link?.id}`}>
            <ToastAction altText="Visit">Visit</ToastAction>
          </Link>
        ),
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
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
                            "w-full pl-3 text-left font-normal",
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
          <div className="space-y-4">
            {" "}
            <Doc
              onUpload={(filePath) => {
                setFilePath(filePath)
              }}
            />
            <Button
              className="bg-[#9FACE6] text-white font-bold px-4 rounded w-full"
              type="submit"
            >
              Create Link
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
