import { ImageResponse } from "@vercel/og"

export default async function handler() {
  return new ImageResponse(
    (
      <div>
        <div
          style={{
            fontSize: 80,
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
          DocBase 📘
        </div>
        <div
          style={{
            fontSize: 40,
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
          Open-Source Alternative to DocSend
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Supported options: 'twemoji', 'blobmoji', 'noto', 'openmoji', 'fluent' and 'fluentFlat'
      // Default to 'twemoji'
      emoji: "twemoji",
    }
  )
}
