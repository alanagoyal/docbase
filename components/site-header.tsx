import Link from "next/link"
import { Database } from "@/types/supabase"
import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "./user-nav"

type User = Database["public"]["Tables"]["users"]["Row"]

export function SiteHeader({ account }: { account: User }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex text-2xl font-semibold">
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
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "sm",
                  variant: "ghost",
                })}
              >
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <ThemeToggle />
            {account ? (
              <UserNav account={account} />
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}