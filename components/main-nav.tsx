import Link from "next/link"
import { NavItem } from "@/types/nav"
import { cn } from "@/lib/utils"

interface MainNavProps {
  items?: NavItem[]
  account?: any
}

export function MainNav({ items, account }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <nav className="flex gap-6">
        {items?.map(
          (item, index) =>
            item.href && (
              (item.title !== "Links" || account) && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-lg font-semibold text-muted-foreground sm:text-sm",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
            )
        )}
      </nav>
    </div>
  )
}