import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "types/supabase"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient<Database>({ req, res })
  await supabase.auth.getSession()
  return res
}
