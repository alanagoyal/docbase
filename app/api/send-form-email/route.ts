import { Resend } from "resend"
import { EmailTemplate } from "@/components/templates/email-form"
import { Database } from "@/types/supabase"
import { logger } from "@/lib/logger"

const resendApiKey = process.env.RESEND_API_KEY || 'build-placeholder';
const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Basic validation - just check required fields exist
    const { name, email, url, investor, fund } = body
    
    if (!name || !email || !url || !investor || !fund) {
      logger.error('Missing required fields in send-form-email request', { receivedFields: Object.keys(body) })
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    
    const { data, error } = await resend.emails.send({
      from: "Docbase <hi@basecase.vc>",
      to: email,
      bcc: investor.email,
      subject: `${fund.name || 'Unknown Fund'} wants to make an investment`,
      react: EmailTemplate({ name, url, investor, fund }),
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
