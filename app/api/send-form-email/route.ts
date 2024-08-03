import { Resend } from "resend"

import { EmailTemplate } from "@/components/templates/email-form"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, url, investor, fund } = body

  try {
    const { data, error } = await resend.emails.send({
      from: "Docbase <hi@basecase.vc>",
      to: email,
      bcc: investor.email,
      subject: `${fund.name} wants to make an investment`,
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
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
