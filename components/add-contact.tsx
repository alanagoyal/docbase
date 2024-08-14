"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Database } from "@/types/supabase"

import ContactForm from "./contact-form"
import { Button } from "./ui/button"

type User = Database["public"]["Tables"]["users"]["Row"]

export default function AddContact({ account }: { account: User }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  return (
    <div>
      <Button
        variant="ghost"
        className="w-[150px]"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline-block ml-2">New</span>
      </Button>
      <ContactForm
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={account}
      />
    </div>
  )
}
