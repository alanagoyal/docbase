"use client"

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
import { createClient } from "@/utils/supabase/client"

const linkFormSchema = z.object({
  email: z
    .string({
      required_error: "Please enter a valid email",
    })
    .email(),
  password: z.string().optional(),
})

type LinkFormValues = z.infer<typeof linkFormSchema>

const defaultValues: Partial<LinkFormValues> = {
  email: "",
  password: "",
}

export default function ViewLinkForm({ link }: { link: any }) {
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues,
  })
  const supabase = createClient()
  const passwordRequired = link?.password ? true : false

  async function onSubmit(data: LinkFormValues) {
    // log viewer
    const updates = {
      link_id: link.id,
      email: data.email,
      viewed_at: new Date().toISOString(),
    }
    await supabase.from("viewers").insert(updates)

    if (!passwordRequired) {
      window.open(link?.url, '_blank')
      return
    }

    // check password
    if (bcrypt.compareSync(data.password!, link.password!)) {
      window.open(link?.url, '_blank')
    } else {
      toast({
        description: "Incorrect password",
      })
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormDescription className="mr-2">
                    Please enter your email to view this document
                  </FormDescription>
                </div>
                <FormControl>
                  <Input {...field} autoComplete="off" />
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
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Password</FormLabel>
                    <FormDescription className="mr-2">
                      Please enter the password to view this document
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <div className="py-1">
            <Button
              className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}