import * as React from "react"
import DOMPurify from "isomorphic-dompurify"

interface NewEmailTemplateProps {
  emailBody: string
}

export const NewEmailTemplate: React.FC<NewEmailTemplateProps> = ({
  emailBody,
}) => {
  const sanitizeConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  }
  
  const sanitizedHtml = DOMPurify.sanitize(emailBody, sanitizeConfig)
  
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      <br />
      <div>
        Sent via <a href={process.env.NEXT_PUBLIC_SITE_URL}>DocBase</a>
      </div>
    </div>
  )
}
