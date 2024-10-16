import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"

type Domain = Database["public"]["Tables"]["domains"]["Row"]

export function useDomainCheck(domain: Domain | null) {
  const router = useRouter()

  const checkDomain = (action: () => void) => {
    if (!domain) {
      toast({
        title: "Domain required",
        description: "Please add a domain to your account to start sending emails",
        action: (
          <Button
            variant="outline"
            onClick={() => router.push("/account?tab=domain")}
          >
            Account
          </Button>
        ),
      })
    } else {
      action()
    }
  }

  return checkDomain
}