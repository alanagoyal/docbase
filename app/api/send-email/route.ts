import { Resend } from "resend"
import { NewEmailTemplate } from "@/components/templates/new-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { to, subject, emailBody } = body

  try {
    const { data, error } = await resend.emails.send({
      from: "Docbase <hi@basecase.vc>",
      to: to,
      subject: subject,
      react: NewEmailTemplate({ emailBody }),
    })

    if (error) {
      console.error("Resend API error:", error)
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Unexpected error in send-email route:", error)
    return new Response(JSON.stringify({ error: "Unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}