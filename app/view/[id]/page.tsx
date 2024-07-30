import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

import { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import ViewLinkForm from "@/components/view-link-form"

type Link = Database["public"]["Tables"]["links"]["Row"] & { creator_name: string | null }

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = createClient()
  const id = params.id

  const { data: link } = await supabase
    .rpc("select_link", {
      link_id: id,
    })
    .single<Link>()

  console.log(link)
  const filename = link?.filename ?? "Untitled Document"
  const creatorName = link?.creator_name ?? "Someone"

  return {
    title: `${creatorName} is sharing ${filename}`,
    openGraph: {
      images: [
        `/api/og/?filename=${encodeURIComponent(
          filename
        )}&creator=${encodeURIComponent(creatorName)}`,
      ],
    },
  }
}

export default async function Doc({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const id = params.id

  const { data: link } = (await supabase
    .rpc("select_link", {
      link_id: id,
    })
    .single<Link>()) as { data: Link | null }

  if (!link) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center flex-col min-h-screen">
        <h1 className="text-2xl text-center font-bold mb-6">Link not found</h1>
        <Link href="/">
          <Button variant="outline">Back Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{link.filename}</h1>
      <ViewLinkForm link={link} />
    </div>
  )
}