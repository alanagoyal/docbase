import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import Investments from "@/components/investments"

export default async function InvestmentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: account, error: accountError } = await supabase
    .from("users")
    .select()
    .eq("id", user?.id)
    .single()

  if (accountError) {
    console.error(accountError)
  }

  const { data: investments, error: investmentError } = await supabase
    .rpc('get_user_investments', { id_arg: user.id })

  if (investmentError) {
    console.error(investmentError)
  }

  return investments && investments.length > 0 ? (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center max-w-5xl mx-auto py-4 relative">
        <div className="w-[150px]" />
        <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
          Investments
        </h1>
        <Link href="/investments/new">
          <Button variant="ghost" className="w-[150px]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline-block ml-2">New</span>
          </Button>
        </Link>
      </div>
      <div className="max-w-5xl mx-auto">
        <Investments account={account} investments={investments} />
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
      <h1 className="text-2xl text-center font-bold mb-6">
        You haven&apos;t created <br /> any investments yet
      </h1>
      <Link href="/investments/new">
        <Button variant="outline">Get Started</Button>
      </Link>
    </div>
  )
}