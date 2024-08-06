import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import InvestmentForm from "@/components/investment-form"
import MagicLink from "@/components/magic-link"

export default async function EditInvestment({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const sharing = searchParams.sharing === "true"
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (sharing) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[80vh]">
            <MagicLink redirect="sharing" />
          </div>
        </div>
      )
    } else {
      redirect("/login")
    }
  }

  const { data: account } = await supabase
    .from("users")
    .select()
    .eq("auth_id", user.id)
    .single()

  const { data: investment } = await supabase
    .from("investments")
    .select(`
      *,
      founder:users!founder_id (name, title, email),
      company:companies (id, name, street, city_state_zip, state_of_incorporation, founder_id),
      investor:users!investor_id (name, title, email),
      fund:funds (id, name, byline, street, city_state_zip, investor_id),
      side_letter:side_letters (id, side_letter_url, info_rights, pro_rata_rights, major_investor_rights, termination, miscellaneous)
    `)
    .eq("id", params.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {investment ? "Investment Details" : "New Investment"}
      </h1>
      <InvestmentForm 
        account={account} 
        investment={investment} 
        isEditMode={!!investment}
      />
    </div>
  )
}