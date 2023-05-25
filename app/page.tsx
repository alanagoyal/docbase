"use client"

import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"

import { useSupabase } from "./supabase-provider"

export default async function IndexPage() {
  const { supabase } = useSupabase()

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/account/",
      },
    })
  }

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
            <Button
              className=" text-white px-8 py-4 rounded-md text-base"
              onClick={signInWithGoogle}
              style={{
                background: "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
              }}
            >
              Get Started
            </Button>
          </div>
        </section>
      </main>

      <footer className="text-center py-8">
        {" "}
        <div className="text-center mb-2">
          <p>
            Built with <span className="text-red-500">❤️</span> by{" "}
            <a
              href="https://twitter.com/alanaagoyal/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alana Goyal
            </a>{" "}
          </p>
        </div>
      </footer>
    </div>
  )
}
