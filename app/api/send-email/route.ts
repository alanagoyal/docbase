import { Resend } from "resend"
import { NewEmailTemplate } from "@/components/templates/new-email"

export async function POST(req: Request) {
  const body = await req.json()
  const { to, subject, emailBody, domainName, senderName, apiKey } = body

  try {
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: `${senderName} <hi@${domainName}>`,
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