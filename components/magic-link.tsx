"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import AuthRefresh from "./auth-refresh"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"

export default function MagicLink({ redirect }: { redirect: string }) {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function signInWithEmail(email: string) {
    setIsSubmitting(true)
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL + redirect
    console.log(redirectUrl)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    })
    setIsSubmitting(false)
    setEmail("")
    if (error) {
      console.error(error)
      toast({
        title: "Failed to send magic link",
        description: error.message,
      })
    } else {
      toast({
        title: "Magic link sent to " + email,
        description: "Please click the link in your email to continue",
      })
    }
  }

  return (
    <>
      <AuthRefresh />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Magic Link
          </CardTitle>
          <CardDescription>
            Please enter your email to authenticate with a magic link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col items-center space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              autoComplete="off"
            />
            <Button
              className="w-full"
              onClick={() => signInWithEmail(email)}
              disabled={isSubmitting}
            >
              Send Magic Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
