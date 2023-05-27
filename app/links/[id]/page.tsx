"use client"

import { type } from "os"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { useSupabase } from "@/app/supabase-provider"

const linkFormSchema = z.object({
  email: z
    .string({
      required_error: "Please enter a valid email",
    })
    .email(),
  password: z.string().optional(),
})

type Links = Database["public"]["Tables"]["links"]["Row"]

type LinkFormValues = z.infer<typeof linkFormSchema>

const defaultValues: Partial<LinkFormValues> = {
  email: "",
  password: "",
}

export default function Doc({ params }: { params: { id: string } }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const id = params.id
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues,
  })
  const [passwordRequired, setPasswordRequired] = useState<boolean>(false)

  useEffect(() => {
    getLink()
  }, [])

  async function getLink() {
    const { data: link, error } = await supabase
      .from("links")
      .select("password, user_id (full_name)")
      .eq("id", id)
      .single()

    if (link?.password) {
      setPasswordRequired(true)
    }

    // setName(link?.user_id?.full_name)
  }

  async function onSubmit(data: LinkFormValues) {
    // log viewer
    const updates = {
      link_id: id,
      email: data.email,
      viewed_at: new Date().toISOString(),
    }
    const { data: viewer } = await supabase.from("viewers").insert(updates)

    // get link
    const { data: link, error } = await supabase
      .from("links")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      router.push("/")
    }

    if (link?.password === data.password) {
      router.push(`${link?.url}`)
    } else {
      toast({
        description: "Incorrect password",
      })
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4"></h1>

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
                  <Input {...field} />
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
                    <Input type="password" {...field} />
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
