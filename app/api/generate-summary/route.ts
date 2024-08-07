import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";

initLogger({
  projectName: "docbase",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

export async function POST(req: Request) {

  const { content } = await req.json();
  console.log("content", content)
  const summary = await handleRequest(content);
  return BraintrustAdapter.toAIStreamResponse(summary);
}

const handleRequest = wrapTraced(async function handleRequest(content ) {
  return await invoke({
    projectName: "docbase",
    slug: "summarize",
    input: {
      content
    },
    stream: true,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;