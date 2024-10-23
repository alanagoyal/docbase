import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { type EmailOtpType } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/"

  ('token_hash:', token_hash);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const decodedNext = decodeURIComponent(next);
  const fullNextUrl = new URL(decodedNext, siteUrl); 

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(fullNextUrl.href)
    }
  }

  const errorUrl = siteUrl + "/error"
  return NextResponse.redirect(errorUrl)
}