import { NextResponse } from "next/server"
import { initLogger, loadPrompt, traced, wrapOpenAI } from "braintrust"
import { OpenAI } from "openai"

initLogger({
  apiKey: process.env.BRAINTRUST_API_KEY,
  projectName: "draftmysafe",
})

const openai = wrapOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://braintrustproxy.com/v1",
  })
)

export const runtime = "edge"

export async function POST(req: Request, res: NextResponse) {
  try {
    let ctrl: ReadableStreamDefaultController | undefined

    ctrl?.enqueue('')

    const stream = new ReadableStream({
      start(controller) {
        ctrl = controller
      },
    })

    new Promise<void>(async (resolve) => {
      try {
        const content = await req.json()

        const prompt = await loadPrompt({
          projectName: "draftmysafe",
          slug: "summarize",
          apiKey: process.env.BRAINTRUST_API_KEY,
        })

        const completion = await traced(
          async (span) => {
            const response = await openai.chat.completions.create(
              prompt.build({
                question: content,
              }),
              {
                headers: {
                  "Accept": "application/json",
                },
              }
            )

            const output = response.choices[0].message.content
            span.log({ input: content, output })
            return output
          },
          { name: "generate-summary", event: content }
        )

        ctrl?.enqueue(new TextEncoder().encode(JSON.stringify({ summary: completion })))
        ctrl?.close()
        resolve()
      } catch (err) {
        console.error(`Failed to generate completion`, err)
      }
    })

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error })
  }
}
