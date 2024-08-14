import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import AddContact from "@/components/add-contact"
import ContactForm from "@/components/contact-form"
import { ContactsTable } from "@/components/contacts"

export default async function Members() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: account } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user.id)
    .single()

  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .eq("created_by", user.id)

  return contacts && contacts.length > 0 ? (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center max-w-5xl mx-auto py-4 relative">
        <div className="w-[150px]" />
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          Contacts
        </h1>
        <AddContact account={account} />
      </div>
      <div className="max-w-5xl mx-auto">
        <ContactsTable contacts={contacts} account={account} />
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t created <br /> any contacts yet
      </h1>
      <AddContact account={account} />
    </div>
  )
}
