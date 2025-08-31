import * as React from "react"

import { Database } from "@/types/supabase"

type Link = Database["public"]["Tables"]["links"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

interface EmailLinkShareProps {
  link: Link
  sender: User
  recipientName?: string
  message?: string
  linkUrl: string
}

export const EmailLinkShareTemplate: React.FC<Readonly<EmailLinkShareProps>> = ({
  link,
  sender,
  recipientName,
  message,
  linkUrl,
}) => (
  <div>
    <p>Hi{recipientName ? ` ${recipientName.split(" ")[0]}` : ""},</p>
    <br />
    <p>
      {sender.name && sender.name.split(" ")[0]} has shared a document with you: <strong>{link.filename}</strong>
    </p>
    <br />
    {message && (
      <>
        <p><em>"{message}"</em></p>
        <br />
      </>
    )}
    <p>
      <a 
        href={linkUrl} 
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: '600'
        }}
      >
        View Document
      </a>
    </p>
    <br />
    <p>
      This link will {link.expires ? `expire on ${new Date(link.expires).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
      })}` : "never expire"}.
    </p>
    <br />
    <p style={{ fontSize: '12px', color: '#666' }}>
      If you're having trouble clicking the button above, copy and paste this URL into your browser:<br />
      <a href={linkUrl} style={{ color: '#007bff' }}>{linkUrl}</a>
    </p>
    <br />
    <div style={{ fontSize: '12px', color: '#999' }}>
      Sent via <a href={process.env.NEXT_PUBLIC_SITE_URL} style={{ color: '#999' }}>DocBase</a>
    </div>
  </div>
)