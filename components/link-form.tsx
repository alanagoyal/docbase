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
import { v4 as uuidv4 } from "uuid"
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

const linkFormSchema = z
  .object({
    protectWithPassword: z.boolean(),
    protectWithExpiration: z.boolean(),
    password: z.string().optional(),
    expires: z.date().nullable(),
    filename: z.string().min(1, "Filename is required"),
  })
  .refine(
    (data) => {
      if (
        data.protectWithPassword &&
        (!data.password || data.password.length === 0)
      ) {
        return false
      }
      return true
    },
    {
      message: "Password is required when protection is enabled",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.protectWithExpiration && !data.expires) {
        return false
      }
      return true
    },
    {
      message: "Expiration date is required when expiration is enabled",
      path: ["expires"],
    }
  )

type LinkFormValues = z.infer<typeof linkFormSchema>
type User = Database["public"]["Tables"]["users"]["Row"]
type Link = Database["public"]["Tables"]["links"]["Row"]

export default function LinkForm({
  link,
  account,
}: {
  link: Link
  account: User
}) {
  const supabase = createClient()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [protectWithPassword, setProtectWithPassword] = useState<boolean>(
    !!link?.password
  )
  const [protectWithExpiration, setProtectWithExpiration] = useState<boolean>(
    !!link?.expires
  )

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      protectWithPassword: !!link?.password,
      protectWithExpiration: !!link?.expires,
      password: link?.password ? "********" : "",
      expires: link?.expires ? new Date(link.expires) : null,
      filename: link?.filename || "",
    },
  })
  const [expiresCalendarOpen, setExpiresCalendarOpen] = useState(false)

  function onSubmit(data: LinkFormValues) {
    if (data && (file || link)) {
      createLink({
        data,
        file,
      })
    } else {
      console.error("Error: No file selected and no existing link")
    }
  }

  async function createUrl({
    filePath,
    expirationSeconds,
  }: {
    filePath: string
    expirationSeconds: number
  }) {
    const { data: signedUrlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, expirationSeconds)

    return signedUrlData?.signedUrl
  }

  async function createLink({
    data,
    file,
  }: {
    data: LinkFormValues
    file: File | null
  }) {
    try {
      let passwordHash = null;

      if (data.protectWithPassword) {
        if (data.password && data.password !== '********') {
          passwordHash = bcrypt.hashSync(data.password, 10);
        } else if (link?.password) {
          passwordHash = link.password;
        } else {
          throw new Error("Password is required when protection is enabled");
        }
      }

      const linkId = link ? link.id : uuidv4();
      const storageFilePath = `${linkId}`;

      // Upload new file or use existing file path
      let filePathToUse = link ? link.id : storageFilePath;

      if (file) {
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storageFilePath, file, { upsert: true })

        if (uploadError) {
          throw uploadError
        }
        filePathToUse = storageFilePath;
      }

      let expirationSeconds: number;
      if (data.protectWithExpiration && data.expires) {
        const currentDate = new Date();
        const expirationDate = new Date(data.expires);
        expirationSeconds = Math.floor((expirationDate.getTime() - currentDate.getTime()) / 1000);
      } else {
        // Set a long expiration time (e.g., 10 years) when expiration is toggled off
        expirationSeconds = 10 * 365 * 24 * 60 * 60; // 10 years in seconds
      }

      const signedUrl = await createUrl({ filePath: filePathToUse, expirationSeconds })

      let result;
      if (link) {
        // Use RPC for updating
        result = await supabase.rpc("update_link", {
          link_id: link.id,
          user_id: account.id,
          url_arg: signedUrl,
          password_arg: passwordHash,
          expires_arg: data.protectWithExpiration ? data.expires?.toISOString() : null,
          filename_arg: data.filename,
        })

      } else {
        // Insert new link
        result = await supabase
          .from("links")
          .insert({
            id: linkId,
            url: signedUrl,
            password: passwordHash,
            expires: data.protectWithExpiration ? data.expires?.toISOString() : null,
            filename: data.filename,
            created_by: account.id,
          })
      }

      if (result.error) throw result.error;

      toast({
        description: link
          ? "Your link has been updated successfully"
          : "Your link has been created successfully",
      })
      router.push("/links")
      router.refresh()
    } catch (error) {
      console.error(error);
      toast({
        description: "An error occurred while saving the link",
        variant: "destructive",
      })
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0]
      setFile(droppedFile)
      form.setValue("filename", droppedFile.name)
      toast({
        description: "File selected successfully",
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormItem className="flex flex-col rounded-lg border p-4">
            <div className="flex flex-row items-center justify-between">
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
                  onCheckedChange={(checked) => {
                    setProtectWithPassword(checked)
                    form.setValue("protectWithPassword", checked)
                    if (!checked) {
                      form.setValue("password", "")
                    }
                  }}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex flex-col rounded-lg border p-4",
                  !protectWithPassword && "hidden"
                )}
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5 flex-grow">
                    <FormLabel htmlFor="password" className="text-base pr-2">
                      Password
                    </FormLabel>
                    <FormDescription className="pr-4">
                      {link?.password
                        ? "Enter a new password or leave blank to keep the existing one"
                        : "Enter a password to protect your document"}
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
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem className="flex flex-col rounded-lg border p-4">
            <div className="flex flex-row items-center justify-between">
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
                  onCheckedChange={(checked) => {
                    setProtectWithExpiration(checked)
                    form.setValue("protectWithExpiration", checked)
                    if (!checked) {
                      form.setValue("expires", null)
                    } else if (!form.getValues("expires")) {
                      const defaultDate = new Date()
                      defaultDate.setDate(defaultDate.getDate() + 30)
                      defaultDate.setHours(defaultDate.getHours() + 1, 0, 0, 0)
                      form.setValue("expires", defaultDate)
                    }
                  }}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
          {protectWithExpiration && (
            <FormField
              control={form.control}
              name="expires"
              render={({ field }) => (
                <FormItem className="flex flex-col rounded-lg border p-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5 flex-grow">
                      <FormLabel htmlFor="expires" className="text-base pr-2">
                        Expires
                      </FormLabel>
                      <FormDescription className="pr-4">
                        Select the expiration date and time for this link
                      </FormDescription>
                    </div>
                    <Popover
                      open={expiresCalendarOpen}
                      onOpenChange={(open) => setExpiresCalendarOpen(open)}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            id="expires"
                            variant="outline"
                            className={cn(
                              "w-[200px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              <>
                                <span className="hidden sm:inline">
                                  {format(field.value, "PPP")}
                                </span>
                                <span className="sm:hidden">
                                  {format(field.value, "MM/dd/yy")}
                                </span>
                              </>
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(newDate) => {
                            if (newDate) {
                              const updatedDate = new Date(newDate)
                              updatedDate.setHours(
                                field.value ? field.value.getHours() : 0
                              )
                              updatedDate.setMinutes(
                                field.value ? field.value.getMinutes() : 0
                              )
                              updatedDate.setSeconds(0)
                              field.onChange(updatedDate)
                            }
                          }}
                          defaultMonth={field.value || new Date()}
                          disabled={(date) =>
                            date < new Date() || date > new Date("2900-01-01")
                          }
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={
                              field.value ? format(field.value, "HH:mm") : ""
                            }
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":")
                              const newDate = new Date(
                                field.value || new Date()
                              )
                              newDate.setHours(
                                parseInt(hours),
                                parseInt(minutes)
                              )
                              field.onChange(newDate)
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {(file || link) && (
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem className="flex flex-col rounded-lg border p-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5 flex-grow">
                      <FormLabel htmlFor="filename" className="text-base pr-2">
                        Filename
                      </FormLabel>
                      <FormDescription className="pr-4">
                        Enter a name for your file
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        id="filename"
                        className="w-[calc(60%-1rem)]"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
              )}
            >
              <input {...getInputProps()} />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop the file here ..."
                  : file
                  ? `File selected: ${file.name}`
                  : "Drag & drop or click to upload a file"}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!file && !link}
            >
              {link ? "Update Link" : "Create Link"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}