import * as React from "react";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";

interface EmailTemplateProps {
  emailContent: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  emailContent,
}) => (
  <Html>
    <Text dangerouslySetInnerHTML={{ __html: emailContent }} />
    <br />
    <div>
      Sent via <a href={process.env.NEXT_PUBLIC_SITE_URL}>DocBase</a>
    </div>
  </Html>
  
);
