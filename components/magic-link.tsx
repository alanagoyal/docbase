"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Icons } from "./icons"

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
  const [isLoading, setIsLoading] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      signInWithEmail(email);
    }
  };

  async function signInWithEmail(email: string) {
    setIsLoading(true)
    const redirectUrl =
      redirect === "sharing"
        ? window.location.href
        : window.location.origin + redirect

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    })
    setIsLoading(false)
    setEmail("")
    if (error) {
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
              onKeyPress={handleKeyPress}
              placeholder="name@email.com"
              autoComplete="off"
            />
            <Button
              className="w-full"
              onClick={() => signInWithEmail(email)}
              disabled={isLoading}
            >
              {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Send Magic Link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}