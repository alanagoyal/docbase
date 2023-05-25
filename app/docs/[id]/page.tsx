"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSupabase } from "@/app/supabase-provider"

type Links = Database["public"]["Tables"]["links"]["Row"]
type Views = Database["public"]["Tables"]["views"]["Row"]
type Viewers = Database["public"]["Tables"]["viewers"]["Row"]

export default function Doc({ params }: { params: { id: string } }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const id = params.id
  const [email, setEmail] = useState<Viewers["email"]>("")
  const [password, setPassword] = useState<Links["password"]>("")

  async function handleSubmit(e: any) {
    console.log(password)
    e.preventDefault()

    // log viewer
    const updates = {
      link_id: id,
      email: email,
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

    if (link?.password === password) {
      router.push(`${link.url}`)
    } else {
      alert("Incorrect password")
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4"></h1>
      <h3 className="text-base mb-4"></h3>
      <form onSubmit={handleSubmit}>
        <h1>Enter password to access document</h1>
        <Label htmlFor="email">Email</Label>
        <Input
          type="text"
          value={email!}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          value={password!}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="py-1">
          <Button
            className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  )
}
