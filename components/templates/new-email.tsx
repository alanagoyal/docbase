import * as React from "react"

interface NewEmailTemplateProps {
  emailBody: string
}

export const NewEmailTemplate: React.FC<NewEmailTemplateProps> = ({
  emailBody,
}) => (
  <div>
    <div dangerouslySetInnerHTML={{ __html: emailBody }} />
    <br />
    <div>
      Sent via <a href={process.env.NEXT_PUBLIC_SITE_URL}>DocBase</a>
    </div>
  </div>
)
