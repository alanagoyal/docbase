import { Button } from "@/components/ui/button"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"


export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto my-48 flex-grow">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
              DocBase
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              The open-source alternative to DocSend
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/new">
            <Button
              className=" text-white px-8 py-4 rounded-md text-base"
              style={{
                background: "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
              }}
            >
              Get Started
            </Button>
            </Link>

            <Link href={siteConfig.links.github}
              className={buttonVariants({variant: "ghost"})}
            >
              View on Github
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
