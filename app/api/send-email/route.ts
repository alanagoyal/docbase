import { NextResponse } from 'next/server';
import { Resend } from "resend"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { NewEmailTemplate } from "@/components/templates/new-email"

// Custom email validation that handles both plain emails and formatted emails like "Name <email@domain.com>"
const emailOrFormattedEmail = z.string().refine((val) => {
  // Check if it's a plain email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(val)) return true
  
  // Check if it's a formatted email like "Name <email@domain.com>"
  const formattedEmailRegex = /^.+\s<[^\s@]+@[^\s@]+\.[^\s@]+>$/
  return formattedEmailRegex.test(val)
}, {
  message: "Must be a valid email address or formatted as 'Name <email@domain.com>'"
})

const sendEmailSchema = z.object({
  to: z.union([emailOrFormattedEmail, z.array(emailOrFormattedEmail)]),
  subject: z.string().min(1).max(500),
  emailBody: z.string().min(1).max(500000), // Increased limits to be more permissive
  domainName: z.string().min(1).max(200),
  senderName: z.string().min(1).max(200),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const validationResult = sendEmailSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("Validation failed for send-email:", {
        errors: validationResult.error.errors,
        receivedData: body
      })
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    let { to, subject, emailBody, domainName, senderName } = validationResult.data

    // Get authenticated user and their domain/API key from server-side
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's domain and API key from the database
    let { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('api_key, domain_name, sender_name')
      .eq('user_id', user.id)
      .eq('domain_name', domainName)
      .single()

    if (domainError) {
      console.error("Domain lookup error:", domainError)
      // Fallback: try to get any domain for this user
      const { data: anyDomain, error: anyDomainError } = await supabase
        .from('domains')
        .select('api_key, domain_name, sender_name')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      
      if (anyDomainError || !anyDomain) {
        return NextResponse.json({ error: `Domain lookup failed: ${domainError.message}` }, { status: 403 })
      }
      
      // Use the found domain instead
      console.log("Using fallback domain:", anyDomain.domain_name)
      domainName = anyDomain.domain_name
      senderName = anyDomain.sender_name
      domain = anyDomain
    }

    if (!domain) {
      console.error("Domain not found for user:", user.id, "domain:", domainName)
      return NextResponse.json({ error: 'Domain not found or unauthorized' }, { status: 403 })
    }

    if (!domain.api_key) {
      console.error("No API key configured for domain:", domainName)
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