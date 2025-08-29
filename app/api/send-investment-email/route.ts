import { Resend } from "resend"
import { EmailTemplate } from "@/components/templates/email-investment"
import { logger } from "@/lib/logger"

const resendApiKey = process.env.RESEND_API_KEY || 'build-placeholder';
const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  const body = await req.json()
  const { emailContent, to, cc, subject } = body

  try {
    const { data, error } = await resend.emails.send({
      from: "Docbase <hi@basecase.vc>",
      to: to,
      cc: cc,
      subject: subject,
      react: EmailTemplate({ emailContent }),
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
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
