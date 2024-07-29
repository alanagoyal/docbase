"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { SignupFormData } from "@/components/signup-form"

export async function signup(formData: SignupFormData) {
  const supabase = createClient()
  const { email, password } = formData

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  let redirectTo = siteUrl + "/account"

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: siteUrl,
    },
  })

  // User exists, but is fake. See https://supabase.com/docs/reference/javascript/auth-signup
  let authError: { name: string; message: string } | null = null
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    authError = {
      name: "AuthApiError",
      message: "User already registered",
    }
    return { success: false, errorMessage: authError?.message }
  } else if (error) {
    authError = {
      name: error.name,
      message: error.message,
    }
    return { success: false, errorMessage: authError?.message }
  } else {
    revalidatePath("/")
    return { success: true }
  }
}
