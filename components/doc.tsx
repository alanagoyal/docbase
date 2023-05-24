import React, { useEffect, useState } from "react"
import { Database } from "types/supabase"

import { useSupabase } from "@/app/supabase-provider"

import { Input } from "./ui/input"
import { Label } from "./ui/label"

type Links = Database["public"]["Tables"]["links"]["Row"]

export default function Doc({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string
  url: Links["url"]
  size: number
  onUpload: (url: string) => void
}) {
  const { supabase } = useSupabase()
  const [docUrl, setDocUrl] = useState<Links["url"]>(null)
  const [uploading, setUploading] = useState(false)

  const uploadDoc: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select a file to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${uid}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from("docs")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert("Error uploading doc!")
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {docUrl ? (
        <div>Doc here</div>
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
          onChange={uploadDoc}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
