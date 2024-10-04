import * as React from "react"

interface NewEmailTemplateProps {
  emailBody: string
}

export const NewEmailTemplate: React.FC<NewEmailTemplateProps> = ({
  emailBody,
}) => (
  <div dangerouslySetInnerHTML={{ __html: emailBody }} />
)