import { ImageResponse } from "next/server"

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          color: "white",
          background: "black",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        DocBase 📘 | Open-Source Alternative to DocSend
      </div>
    ),
    {
      width: 1200,
      height: 630,
      emoji: "twemoji",
    }
  )
}
