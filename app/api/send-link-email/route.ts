import { NextResponse } from 'next/server';
import { Resend } from "resend"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { EmailLinkShareTemplate } from "@/components/templates/email-link-share"
import { logger } from "@/lib/logger"

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

const sendLinkEmailSchema = z.object({
  to: z.union([emailOrFormattedEmail, z.array(emailOrFormattedEmail)]),
  linkId: z.string().uuid(),
  message: z.string().optional(),
  domainName: z.string().min(1).max(200),
  senderName: z.string().min(1).max(200),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const validationResult = sendLinkEmailSchema.safeParse(body)
    if (!validationResult.success) {
      logger.error('Validation failed for send-link-email', {
        errors: validationResult.error.errors,
        receivedData: body
      })
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    let { to, linkId, message, domainName, senderName } = validationResult.data

    // Get authenticated user and their domain/API key from server-side
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the link details and verify ownership
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .single()

    if (linkError || !link) {
      logger.error('Link not found or unauthorized', { linkId, userId: user.id })
      return NextResponse.json({ error: 'Link not found or unauthorized' }, { status: 404 })
    }

    // Get user details for sender info
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (senderError || !sender) {
      logger.error('Sender user not found', { userId: user.id })
      return NextResponse.json({ error: 'Sender user not found' }, { status: 404 })
    }

    // Get the user's domain and API key from the database
    let { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('api_key, domain_name, sender_name')
      .eq('user_id', user.id)
      .eq('domain_name', domainName)
      .single()

    if (domainError) {
      logger.error('Domain lookup error', { error: domainError })
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
      logger.info('Using fallback domain', { domainName: anyDomain.domain_name })
      domainName = anyDomain.domain_name
      senderName = anyDomain.sender_name
      domain = anyDomain
    }

    if (!domain) {
      logger.error('Domain not found for user', { userId: user.id, domainName })
      return NextResponse.json({ error: 'Domain not found or unauthorized' }, { status: 403 })
    }

    if (!domain.api_key) {
      logger.error('No API key configured for domain', { domainName })
      return NextResponse.json({ error: 'No API key configured for this domain' }, { status: 400 })
    }

    const linkUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/links/view/${linkId}`
    const subject = `${sender.name || senderName} shared "${link.filename}" with you`

    const resend = new Resend(domain.api_key)

    const { data, error } = await resend.emails.send({
      from: `${senderName} <hi@${domainName}>`,
      to: to,
      subject: subject,
      react: EmailLinkShareTemplate({ 
        link, 
        sender, 
        message, 
        linkUrl,
        recipientName: Array.isArray(to) ? to[0] : to 
      }),
    })

    if (error) {
      logger.error('Resend API error', { error })
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
    return NextResponse.json(data)
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    logger.error('Unexpected error in send-link-email route', { error })
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 })
  }
}