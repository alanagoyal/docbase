"use client"

import React, { useRef, useState } from "react"
import { Database } from "types/supabase"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"
import { createClient } from "@/utils/supabase/client"


export default function Doc({ onUpload }: { onUpload: (url: string) => void }) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [complete, setComplete] = useState(false)

  const uploadDoc: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select a file to upload")
      }
      const file = event.target.files[0]
      const filePath = `${file.name}`

      // upload file to storage bucket
      let { error: uploadError } = await supabase.storage
        .from("docs")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      toast({
        description: "Error uploading file",
      })
      console.error(error)
    } finally {
      setUploading(false)
      setComplete(true)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      {" "}
      {!complete ? (
        <div>
          <Button
            className="w-full"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault()
              fileInputRef.current && fileInputRef.current.click()
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <Input
            style={{ visibility: "hidden", position: "absolute" }}
            type="file"
            ref={fileInputRef}
            onChange={uploadDoc}
          />
        </div>
      ) : (
        <div>
          {" "}
          <Button
            className="w-full"
            disabled={complete}
            onClick={(e) => {
              e.preventDefault()
              fileInputRef.current && fileInputRef.current.click()
            }}
          >
            Uploaded
          </Button>
        </div>
      )}
    </div>
  )
}
