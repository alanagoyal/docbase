"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Link, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Links } from "@/components/links"

import { useSupabase } from "../supabase-provider"

export default function LinksPage() {
  const { supabase } = useSupabase()
  const [allLinks, setAllLinks] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    getLinks()
  }, [])

  async function deleteLink(linkId: string) {
    console.log("on delete link in page")
    console.log(linkId)
    const { error } = await supabase.from("links").delete().eq("id", linkId)
    if (error) {
      console.log(error)
    }
    toast({
      description: "Your link has been deleted",
    })
    getLinks()
  }
  async function getLinks() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { data: links, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", session?.user.id)
    setAllLinks(links)
  }
  return (
    <div className="flex flex-col items-center pt-20 py-2">
      <h1 className="text-4xl font-bold mb-4">Your Links</h1>
      <div className="w-half">
        <Links allLinks={allLinks} onDeleteLink={deleteLink} />
      </div>
      <div className="mt-4">
        <Button
          className="bg-[#9FACE6] text-white font-bold py-2 px-4 rounded w-full"
          onClick={(e) => {
            e.preventDefault()
            router.push("/new")
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Link
        </Button>
      </div>
    </div>
  )
}
