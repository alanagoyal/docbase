"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNavItems } from "@/config/main-nav"
import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type User = Database["public"]["Tables"]["users"]["Row"]

export function MainNav({
  className,
  account,
  ...props
}: React.HTMLAttributes<HTMLElement> & { account: User }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("flex items-center", className)}
      {...props}
    >
      <div className="hidden md:flex space-x-6 items-center">
        {mainNavItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary leading-none",
              pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {mainNavItems.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "w-full",
                    pathname.startsWith(item.href) ? "font-bold" : ""
                  )}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}