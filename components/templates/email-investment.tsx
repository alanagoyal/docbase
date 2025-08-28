import * as React from "react";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import DOMPurify from "isomorphic-dompurify";

interface EmailTemplateProps {
  emailContent: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  emailContent,
}) => {
  const sanitizeConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  }
  
  const sanitizedHtml = DOMPurify.sanitize(emailContent, sanitizeConfig)
  
  return (
    <Html>
      <Text dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      <div>
        Sent via <a href={process.env.NEXT_PUBLIC_SITE_URL}>DocBase</a>
      </div>
    </Html>
  )
};
