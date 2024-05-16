import React, { useEffect, useState } from "react"
import { Database } from "types/supabase"

import { useSupabase } from "@/app/supabase-provider"

import { Input } from "./ui/input"
import { Label } from "./ui/label"

type Profiles = Database["public"]["Tables"]["profiles"]["Row"]

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string
  url: Profiles["avatar_url"]
  size: number
  onUpload: (url: string) => void
}) {
  const { supabase } = useSupabase()
  const [avatarUrl, setAvatarUrl] = useState<Profiles["avatar_url"]>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.error("Error downloading image: ", error)
    }
  }

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${uid}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert("Error uploading avatar!")
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className="avatar no-image"
          style={{ height: size, width: size }}
        />
      )}
      <div style={{ width: size }}>
        <Label className="button primary block" htmlFor="single">
          {uploading ? "Uploading ..." : "Upload"}
        </Label>
        <Input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
