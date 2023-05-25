"use client"

import { useEffect, useState } from "react"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Doc from "@/components/doc"

import { useSupabase } from "../supabase-provider"

type Links = Database["public"]["Tables"]["links"]["Row"]

export default function NewLink() {
  const { supabase } = useSupabase()
  const [userId, setUserId] = useState<Links["user_id"]>("")
  const [url, setUrl] = useState<Links["url"]>("")
  const [password, setPassword] = useState<Links["password"]>(null)
  const [emailProtected, setEmailProtected] =
    useState<Links["email_protected"]>(false)
  const [expires, setExpires] = useState<Links["expires"]>("")
  const [downloadEnabled, setDownloadEnabled] =
    useState<Links["download_enabled"]>(false)
  const [editsEnabled, setEditsEnabled] =
    useState<Links["edits_enabled"]>(false)
  const [user, setUser] = useState<any>("")

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user.id || "")
  }

  async function createLink({
    url,
    password,
    emailProtected,
    expires,
    downloadEnabled,
    editsEnabled,
  }: {
    url: Links["url"]
    password: Links["password"]
    emailProtected: Links["email_protected"]
    expires: Links["expires"]
    downloadEnabled: Links["download_enabled"]
    editsEnabled: Links["edits_enabled"]
  }) {
    try {
      const updates = {
        user_id: user,
        url: url,
        password: password,
        email_protected: emailProtected,
        expires: expires,
        download_enabled: downloadEnabled,
        edits_enabled: editsEnabled,
      }

      console.log(updates)

      let { error } = await supabase.from("links").insert(updates)
      if (error) throw error
      alert("Link created successfully!")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">New Link</h1>
      <h3 className="text-base mb-4"></h3>
      <div>
        <div>
          <Doc
            uid={user}
            url={url}
            size={150}
            expires={expires || ""}
            onUpload={(url) => {
              setUrl(url)
            }}
          />
        </div>
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
            <Button
              type="submit"
              className="bg-[#21D4FD] text-white font-bold py-2 px-4 rounded w-full"
              onClick={() =>
                createLink({
                  url,
                  password,
                  emailProtected,
                  expires,
                  downloadEnabled,
                  editsEnabled,
                })
              }
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
