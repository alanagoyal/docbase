import Link from "next/link"
import { cn } from "@/lib/utils"
import { mainNavItems } from "@/config/main-nav"
import { Database } from "@/types/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]

export function MainNav({
  className,
  account,
  ...props
}: React.HTMLAttributes<HTMLElement> & { account: User }) {
  return (
    <nav
      className={cn("flex items-center space-x-6 pt-1", className)}
      {...props}
    >
      {mainNavItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            index === 0 ? "" : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}