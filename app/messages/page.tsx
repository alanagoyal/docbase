import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { Button } from "@/components/ui/button"
import { MessagesTable } from "@/components/messages"

export default async function Messages() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching messages:", error)
  }

  return messages && messages.length > 0 ? (
    <MessagesTable messages={messages} />
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t sent <br /> any messages yet
      </h1>
      <Link href="/messages">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}
