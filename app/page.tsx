import Link from "next/link"
import { Github } from "lucide-react"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="flex flex-col mih-h-dvh">
      <main className="container mx-auto my-48 flex-grow">
        <section className="text-center">
          <h1 className="text-5xl font-bold">
            {siteConfig.tagline}
          </h1>
          <p className="text-lg mt-4">
            {siteConfig.description}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/links">
              <Button
                className="transition-opacity hover:opacity-70"
                style={{
                  background:
                    "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
                }}
              >
                Get Started
              </Button>
            </Link>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </Link>
          </div>
        </section>
        <section className="mt-24 flex justify-center"></section>
      </main>
    </div>
  )
}
