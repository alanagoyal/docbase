"use client"

import { toast } from "@/components/ui/use-toast"
import { clientLogger } from "@/lib/client-logger" 

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
    const base64Image = await fileToBase64(file)

    const response = await fetch("/api/parse-signature-block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      clientLogger.error('API Error', { status: response.status, errorText })
      throw new Error(`Failed to parse signature block: ${response.status} ${errorText}`)
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
    clientLogger.error('Error in parseSignatureBlock', { error })
    throw error
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}