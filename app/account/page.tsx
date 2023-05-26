"use client"

import { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useSupabase } from "../supabase-provider"

const profileFormSchema = z.object({
  email: z
    .string({
      required_error: "Please enter a valid email",
    })
    .email(),
  name: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  email: "",
  name: "",
}

type Profiles = Database["public"]["Tables"]["profiles"]["Row"]

export default function Account() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [name, setName] = useState<Profiles["full_name"]>("")
  const [email, setEmail] = useState<Profiles["email"]>("")
  const [avatar, setAvatar] = useState<Profiles["avatar_url"]>("")
  const [user, setUser] = useState<any>("")
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })
  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user.id)
    if (!session) {
      router.push("/")
    }

    try {
      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single()

      if (error && status != 406) {
        throw error
      }

      if (data) {
        console.log(data)
        setName(data.full_name)
        setEmail(data.email)
        setAvatar(data.avatar_url)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function onSubmit(data: ProfileFormValues) {
    if (data) {
      updateProfile({ data, avatar })
    }
  }

  async function updateProfile({
    data,
    avatar,
  }: {
    data: ProfileFormValues
    avatar: Profiles["avatar_url"]
  }) {
    try {
      const updates = {
        email: email,
        full_name: data.name,
        avatar_url: avatar,
      }

      let { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user)
      if (error) throw error
      alert("Updated!")
    } catch (error) {
      console.log(error)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Account</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {" "}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base mx-2">Email</FormLabel>
                </div>
                <FormControl>
                  <Input placeholder={email!} {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base mx-2">Name</FormLabel>
                </div>
                <FormControl>
                  <Input placeholder={name!} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="py-1">
            <Button
              type="submit"
              className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
            >
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
