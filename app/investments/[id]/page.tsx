import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

import { Database, UserInvestment } from "@/types/supabase"
import InvestmentForm from "@/components/investment-form"
import MagicLink from "@/components/magic-link"

type Investment = Database["public"]["Tables"]["investments"]["Row"] & {
  fund_name: string | null
  company_name: string | null
  investor_name: string | null
}
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
    .eq("id", user.id)
    .single()

  const { data: investment } = await supabase
    .rpc("get_user_investments_by_id", { investment_id_arg: params.id, id_arg: user.id })
    .single<UserInvestment>()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {investment ? "Investment Details" : "New Investment"}
      </h1>
      <InvestmentForm
        account={account}
        investment={investment || undefined}
        isEditMode={!!investment}
      />
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = createClient()
  const id = params.id

  const { data: investment } = await supabase
    .rpc("select_investment_entities", { investment_id: id })
    .single<Investment>()

  const fundName = investment?.fund_name ?? "Someone"
  const companyName = investment?.company_name ?? "a company"

  return {
    title: `${fundName} wants to invest in ${companyName}`,
    openGraph: {
      images: [`/api/og/?id=${encodeURIComponent(id)}&type=investment`],
    },
  }
}