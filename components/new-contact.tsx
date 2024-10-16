"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact-form"

type NewContactButtonProps = {
  account: any
  groups: any[]
}

export function NewContactButton({ account, groups }: NewContactButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        Get Started
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your list
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            account={account}
            groups={groups}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}