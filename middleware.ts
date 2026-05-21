import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "types/supabase"

export async function middleware(req: NextRequest) {
  // Build health verification
  if (req.nextUrl.pathname === '/_build_info') {
    return NextResponse.json({
      node: process.version,
      platform: process.platform,
      ts: Date.now(),
      vars: process.env
    })
  }
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient<Database>({ req, res })
  await supabase.auth.getSession()
  return res
}
