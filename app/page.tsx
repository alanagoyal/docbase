import { Button } from "@/components/ui/button"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"


export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="container mx-auto my-48 flex-grow">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
              Docbase
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              The open-source alternative to Docsend
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/new" className="w-full sm:w-auto">
              <Button
                className="w-full text-white px-8 py-4 rounded-md text-base whitespace-nowrap"
                style={{
                  background: "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
                }}
              >
                Get Started
              </Button>
            </Link>

            <Link href={siteConfig.links.github}
              className={buttonVariants({variant: "ghost", className: "hidden sm:inline-flex w-full sm:w-auto"})}
            >
              View on Github
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
