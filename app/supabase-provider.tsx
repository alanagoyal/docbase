"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Session,
  createBrowserSupabaseClient,
  type SupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import type { Database } from "types/supabase"

type MaybeSession = Session | null

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: MaybeSession
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: MaybeSession
}) {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const router = useRouter()

  useEffect(() => {
    console.log("REFRESHING")
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <Context.Provider value={{ supabase, session }}>
      <>{children}</>
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }

  return context
}
