"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { LoginFormData } from "@/components/login-form"

export async function login(formData: LoginFormData) {
  const supabase = createClient()
  const { email, password } = formData
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const isAlreadyUser = await supabase.rpc("checkIfUser", {
      given_mail: email,
    })
    if (isAlreadyUser.data === false) {
      return {
        errorMessage:
          "No account exists for this email address. Please sign up for an account.",
      }
    } else {
      return { errorMessage: error.message }
    }
  }
  revalidatePath("/", "layout")
  redirect("/account")
}
