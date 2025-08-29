import { NextResponse } from 'next/server';
import { Resend } from "resend"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { NewEmailTemplate } from "@/components/templates/new-email"
import { logger } from "@/lib/logger"

// Temporary: More permissive validation for debugging
const sendEmailSchema = z.object({
  to: z.union([z.string(), z.array(z.string())]).refine((val) => {
    // Allow any non-empty string or array of non-empty strings
    if (Array.isArray(val)) {
      return val.length > 0 && val.every(email => typeof email === 'string' && email.length > 0)
    }
    return typeof val === 'string' && val.length > 0
  }, {
    message: "Must be a non-empty string or array of non-empty strings"
  }),
  subject: z.string().min(1),
  emailBody: z.string().min(1),
  domainName: z.string().min(1),
  senderName: z.string().min(1),
})
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Debug logging to understand the request structure
    logger.info('Send email request received', {
      bodyKeys: Object.keys(body),
      toType: typeof body.to,
      toValue: body.to,
      subjectType: typeof body.subject,
      emailBodyType: typeof body.emailBody,
      domainNameType: typeof body.domainName,
      senderNameType: typeof body.senderName,
    })
    
    // Temporary: Skip validation for debugging
    // const validationResult = sendEmailSchema.safeParse(body)
    // if (!validationResult.success) {
    //   logger.error('Validation failed for send-email', {
    //     errors: validationResult.error.errors,
    //     receivedData: body
    //   })
    //   return NextResponse.json(
    //     { 
    //       error: "Invalid input", 
    //       details: validationResult.error.errors,
    //       receivedFields: Object.keys(body),
    //       debug: "Check server logs for detailed validation errors"
    //     },
    //     { status: 400 }
    //   )
    // }
    
    // Extract data directly without validation
    let { to, subject, emailBody, domainName, senderName } = body

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

    const resend = new Resend(domain.api_key)

    const { data, error } = await resend.emails.send({
      from: `${senderName} <hi@${domainName}>`,
      to: to,
      subject: subject,
      react: NewEmailTemplate({ emailBody }),
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
    logger.error('Unexpected error in send-email route', { error })
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 })
  }
}