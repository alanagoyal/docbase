import { ImageResponse } from "next/og"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"

type Link = Database["public"]["Tables"]["links"]["Row"]

export const dynamic = "force-dynamic";

function getFallbackOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "50px 200px",
            textAlign: "center",
            fontSize: "120px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
          <span style={{ color: "black" }}>base</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      emoji: "twemoji",
    }
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")
  const creatorName = searchParams.get("creator") || "Someone"

  if (!filename) {
    return getFallbackOGImage()
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "white",
          fontFamily: "Arial, sans-serif",
          padding: "40px",
        }}
      >
        <div style={{ fontSize: "32px", display: "flex" }}>
          <span
            style={{
              backgroundImage:
                "linear-gradient(48deg, #74EBD5 0%, #9FACE6 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              display: "flex",
              alignItems: "center",
            }}
          >
            Doc
          </span>
          <span style={{ color: "black" }}>base</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              color: "#666",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {creatorName} is sharing a file with you
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "black",
              display: "flex",
              alignItems: "center",
            }}
          >
            {filename || "Untitled Document"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}