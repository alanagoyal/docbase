import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className = '' }) => {
  const sanitizeConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
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
