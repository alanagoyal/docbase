import { Resend } from "resend"

import { EmailTemplate } from "@/components/templates/email-investment"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { investmentData, safeAttachment, sideLetterAttachment, emailContent } = body

  try {
    const attachments = [];
    if (safeAttachment) {
      attachments.push({
        filename: `${investmentData.company.name}-SAFE.docx`,
        content: safeAttachment,
      });
    }
    if (sideLetterAttachment) {
      attachments.push({
        filename: `${investmentData.company.name}-Side-Letter.docx`,
        content: sideLetterAttachment,
      });
    }

    const { data, error } = await resend.emails.send({
      from: "Docbase <hi@basecase.vc>",
      to: investmentData.founder.email,
      cc: investmentData.investor.email,
      subject: `${investmentData.company.name} <> ${investmentData.fund.name}`,
      react: EmailTemplate({ emailContent: emailContent }),
      attachments: attachments,
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
