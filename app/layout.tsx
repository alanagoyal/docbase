import "@/styles/globals.css"
import { Metadata } from "next"
import { createClient } from "@/utils/supabase/server"
import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { CommandMenu } from "@/components/command-menu"
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.tagline,
  openGraph: {
    images: ["/api/og"],
  },
};

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: account } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .single()

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="beforeInteractive"
          />
        </head>
        <body
          className={cn(
            "min-h-dvh bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-dvh flex-col">
              <SiteHeader account={account} />
              <Toaster />
              {children}
              <CommandMenu />
              <div className="flex-1"></div>
            </div>
            <TailwindIndicator />
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}