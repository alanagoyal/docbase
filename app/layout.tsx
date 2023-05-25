import "@/styles/globals.css"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

import SupabaseProvider from "./supabase-provider"

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: "DocBase",
  description: "The open-source alternative to DocSend",
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const supabase = createServerComponentSupabaseClient({
    headers,
    cookies,
  })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <SupabaseProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                {children}
                <div className="flex-1"></div>
              </div>
              <TailwindIndicator />
            </ThemeProvider>
          </SupabaseProvider>
        </body>
      </html>
    </>
  )
}
