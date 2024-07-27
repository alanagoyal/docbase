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
      <nav className="flex gap-6 justify-center">
        <Link href="/" className="flex text-xl font-semibold">
          <span
            style={{
              backgroundImage:
                "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Doc
          </span>
          base
        </Link>
      </nav>
    </div>
  )
}
