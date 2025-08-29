import { Resend } from "resend"
import { z } from "zod"
import { EmailTemplate } from "@/components/templates/email-form"
import { Database } from "@/types/supabase"
import { logger } from "@/lib/logger"

const resendApiKey = process.env.RESEND_API_KEY || 'build-placeholder';
const resend = new Resend(resendApiKey);

const sendFormEmailSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  url: z.string().url().max(500),
  investor: z.object({
    id: z.string().optional(),
    created_at: z.string().optional(),
    email: z.string().email(),
    name: z.string().min(1).max(100).nullable(),
    title: z.string().nullable().optional(),
    messages: z.array(z.string()).nullable().optional(),
    updated_at: z.string().nullable().optional(),
  }),
  fund: z.object({
    id: z.string().optional(),
    created_at: z.string().optional(),
    name: z.string().min(1).max(100).nullable(),
    byline: z.string().nullable().optional(),
    city_state_zip: z.string().nullable().optional(),
    contact_id: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
  }),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const validationResult = sendFormEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    
    const { name, email, url, investor, fund } = validationResult.data
    
    // Cast to proper types for the EmailTemplate
    const investorData: Database["public"]["Tables"]["users"]["Row"] = {
      id: investor.id || '',
      created_at: investor.created_at || new Date().toISOString(),
      email: investor.email,
      name: investor.name,
      title: investor.title || null,
      messages: investor.messages || null,
      updated_at: investor.updated_at || null,
    }
    
    const fundData: Database["public"]["Tables"]["funds"]["Row"] = {
      id: fund.id || '',
      created_at: fund.created_at || new Date().toISOString(),
      name: fund.name,
      byline: fund.byline || null,
      city_state_zip: fund.city_state_zip || null,
      contact_id: fund.contact_id || null,
      street: fund.street || null,
    }
    
    const { data, error } = await resend.emails.send({
      from: "Docbase <hi@basecase.vc>",
      to: email,
      bcc: investor.email,
      subject: `${fund.name || 'Unknown Fund'} wants to make an investment`,
      react: EmailTemplate({ name, url, investor: investorData, fund: fundData }),
    })

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    return new Response(JSON.stringify({ error: "Unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
