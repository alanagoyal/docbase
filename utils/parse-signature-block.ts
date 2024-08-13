"use client"

import { createClient } from "./supabase/client"
import { toast } from "@/components/ui/use-toast" // Import toast

export async function parseSignatureBlock(file: File): Promise<{
  entity_name?: string
  name?: string
  title?: string
  street?: string
  city_state_zip?: string
  state_of_incorporation?: string
  byline?: string
  type?: "fund" | "company"
}> {
  try {
    const signedUrl = await uploadFileToSupabase(file)

    const response = await fetch("/api/parse-signature-block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: signedUrl }),
    })


    if (!response.ok) {
      const errorData = await response.json()
      console.error("API Error:", errorData)
      throw new Error(`Failed to parse signature block: ${response.status} ${errorData.error || ''}`)
    }

    const data = await response.json()

    // Check if the response contains any of the expected fields
    if (!data.entity_name && !data.name && !data.title && !data.street && !data.city_state_zip && !data.state_of_incorporation && !data.byline) {
      toast({
        description: "Unable to parse signature block",
      })
      throw new Error("No expected fields in response")
    }

    return data
  } catch (error) {
    console.error("Error in parseSignatureBlock:", error)
    throw error
  }
}

async function uploadFileToSupabase(file: File): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(`${Date.now()}-${file.name}`, file)

  if (error) {
    throw new Error(`Failed to upload file to Supabase: ${error.message}`)
  }

  const { data: signedUrl } = await supabase.storage
    .from("documents")
    .createSignedUrl(data.path, 1800)

  return signedUrl?.signedUrl || ""
}