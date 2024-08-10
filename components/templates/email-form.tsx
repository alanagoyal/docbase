import { Database } from "@/types/supabase"
import * as React from "react"

type Fund = Database["public"]["Tables"]["funds"]["Row"]
type Investor = Database["public"]["Tables"]["users"]["Row"]

interface EmailTemplateProps {
  name: string
  url: string
  investor: Investor
  fund: Fund
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  url,
  investor,
  fund,
}) => (
  <div>
    <p>Hi {name.split(" ")[0]},</p>
    <p>
      {investor.name && investor.name.split(" ")[0]} from {fund.name} wants to make an investment
      in your company. Please follow <a href={url}>this link</a> to enter your
      information for the SAFE Agreement.
    </p>
    <p>
      Please note that your information will only be shared with {investor.name}{" "}
      from {fund.name} for the purposes of drafting the SAFE Agreement. Once
      submitted, they will reach out to you to get your approval before
      circulating the agreement for e-signing.
    </p>
  </div>
)
