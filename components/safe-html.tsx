import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};