"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
  type Message = {
    id: string
    subject: string
    recipient: string
    created_at: string
    status: string
  }
  
  export function MessagesTable({ messages }: { messages: Message[] }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>{message.subject}</TableCell>
              <TableCell>{message.recipient}</TableCell>
              <TableCell>{new Date(message.created_at).toLocaleString()}</TableCell>
              <TableCell>{message.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }