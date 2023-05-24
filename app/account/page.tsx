"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Session } from "@supabase/auth-helpers-nextjs"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useSupabase } from "../supabase-provider"

type Profiles = Database["public"]["Tables"]["profiles"]["Row"]

export default function Account() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [name, setName] = useState<Profiles["full_name"]>("")
  const [email, setEmail] = useState<Profiles["email"]>("")
  const [avatar, setAvatar] = useState<Profiles["avatar_url"]>("")

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log(session?.user.id)

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

  async function updateProfile({
    name,
    avatar,
  }: {
    name: Profiles["full_name"]
    avatar: Profiles["avatar_url"]
  }) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    try {
      const updates = {
        email: email,
        full_name: name,
        avatar_url: avatar,
      }

      let { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session!.user.id)
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
      <h3 className="text-base mb-4"></h3>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="text"
          value={email || ""}
          className="h-10 p-1"
          disabled
        />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name || ""}
          className="h-10 p-1"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="pt-1">
        <div className="py-1">
          <Button
            type="submit"
            className="bg-[#21D4FD] text-white font-bold py-2 px-4 rounded w-full"
            onClick={() => updateProfile({ name, avatar })}
          >
            Update
          </Button>
        </div>

        <div className="py-1">
          <Button
            type="button"
            className="bg-slate-700 text-white font-bold py-2 px-4 rounded w-full"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
