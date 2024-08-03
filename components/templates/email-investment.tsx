import * as React from "react";
import parse from "html-react-parser";

interface EmailTemplateProps {
  emailContent: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  emailContent,
}) => <div>{parse(emailContent)}</div>;
