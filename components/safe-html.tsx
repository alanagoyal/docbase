import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className = '' }) => {
  const sanitizeConfig = {
    ALLOW_UNKNOWN_PROTOCOLS: true,
  };

  const sanitizedHtml = DOMPurify.sanitize(html, sanitizeConfig);

  return (
    <div 
      className={`safe-html ${className} text-sm`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
};
