"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import * as bcrypt from "bcryptjs"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"
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

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Switch } from "./ui/switch"
import { toast } from "./ui/use-toast"

const linkFormSchema = z.object({
  protectWithPassword: z.boolean(),
  protectWithExpiration: z.boolean(),
  password: z.string().optional(),
  expires: z.date({ required_error: "Please enter a valid date" }),
})

type LinkFormValues = z.infer<typeof linkFormSchema>
type User = Database["public"]["Tables"]["users"]["Row"]

export default function LinkForm({
  link,
  account,
}: {
  link: any
  account: User
}) {
  const supabase = createClient()
  const router = useRouter()
  const [filePath, setFilePath] = useState<string>("")
  const [protectWithPassword, setProtectWithPassword] = useState<boolean>(false)
  const [protectWithExpiration, setProtectWithExpiration] =
    useState<boolean>(true)
  const [uploading, setUploading] = useState(false)
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
    if (data && filePath) {
      createLink({
        filePath,
        data,
      })
    } else {
      console.error("Error with filename")
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
      .from("documents")
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
        created_by: account.auth_id,
        url: signedUrl,
        password: data.password ? passwordHash : null,
        expires: data.expires.toISOString(),
        filename: filePath,
      }
      let { data: link, error } = await supabase
        .from("links")
        .upsert(updates)
        .select("id")
        .single()
      if (error) throw error

      if (link) {
        toast({
          description: "Your link has been created successfully",
        })
        router.push("/links")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      try {
        setUploading(true)
        const filePath = `${file.name}`

        // Upload file to storage bucket
        let { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        setFilePath(filePath)
        toast({
          description: "File uploaded successfully",
        })
      } catch (error) {
        toast({
          description: "Error uploading file",
        })
        console.error(error)
      } finally {
        setUploading(false)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-grow">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex flex-row items-center justify-between rounded-lg border p-4",
                  !protectWithPassword && "hidden"
                )}
              >
                <div className="space-y-0.5 flex-grow">
                  <FormLabel htmlFor="password" className="text-base pr-2">
                    Password
                  </FormLabel>
                  <FormDescription className="pr-4">
                    Enter a password to protect your document
                  </FormDescription>
                </div>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    className="w-[200px]"
                    {...field}
                    disabled={!protectWithPassword}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-grow">
              <FormLabel className="text-base pr-2">
                Set Expiration Date
              </FormLabel>
              <FormDescription className="pr-4">
                Viewers will no longer be able to access your link after this
                date
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={protectWithExpiration}
                onCheckedChange={setProtectWithExpiration}
              />
            </FormControl>
          </FormItem>
          <FormField
            control={form.control}
            name="expires"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex flex-row items-center justify-between rounded-lg border p-4",
                  !protectWithExpiration && "hidden"
                )}
              >
                <div className="space-y-0.5 flex-grow">
                  <FormLabel htmlFor="expires" className="text-base pr-2">
                    Expires
                  </FormLabel>
                  <FormDescription className="pr-4">
                    Viewers will no longer be able to access your link after
                    this date
                  </FormDescription>
                </div>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[200px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!protectWithExpiration}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        id="expires"
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer",
                uploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <p className="text-sm text-muted-foreground">
                {uploading
                  ? "Uploading..."
                  : isDragActive
                  ? "Drop the file here ..."
                  : "Drag & drop or click to upload a file"}
              </p>
            </div>
            {filePath && (
              <p className="text-sm text-muted-foreground">
                Selected file: {filePath}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !filePath}
            >
              Create Link
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
