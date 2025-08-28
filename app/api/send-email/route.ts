import { NextResponse } from 'next/server';
import { Resend } from "resend"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { NewEmailTemplate } from "@/components/templates/new-email"

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(200),
  emailBody: z.string().min(1).max(50000),
  domainName: z.string().min(1).max(100),
  senderName: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const validationResult = sendEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const { to, subject, emailBody, domainName, senderName } = validationResult.data

    // Get authenticated user and their domain/API key from server-side
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's domain and API key from the database
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('api_key, domain_name, sender_name')
      .eq('user_id', user.id)
      .eq('domain_name', domainName)
      .single()

    if (domainError || !domain) {
      return NextResponse.json({ error: 'Domain not found or unauthorized' }, { status: 403 })
    }

    if (!domain.api_key) {
      return NextResponse.json({ error: 'No API key configured for this domain' }, { status: 400 })
    }

    const resend = new Resend(domain.api_key)

    const { data, error } = await resend.emails.send({
      from: `${senderName} <hi@${domainName}>`,
      to: to,
      subject: subject,
      react: NewEmailTemplate({ emailBody }),
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
    return NextResponse.json(data)
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    console.error("Unexpected error in send-email route:", error)
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 })
  }
}