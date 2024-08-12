import { invoke, initLogger, wrapTraced } from "braintrust";
import { NextResponse } from 'next/server';

initLogger({
  projectName: "docbase",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  const data = await handleRequest(imageUrl);
  
  return NextResponse.json(data);
}

const handleRequest = wrapTraced(async function handleRequest(imageUrl: string) {
  return await invoke({
    projectName: "docbase",
    slug: "parse-signature-block",
    input: {
      imageUrl,
    },
    stream: false,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;