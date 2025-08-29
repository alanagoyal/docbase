import { invoke, initLogger, wrapTraced } from "braintrust";
import { NextResponse } from 'next/server';
import { logger } from "@/lib/logger";

initLogger({
  projectName: "docbase",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64Image } = body;
    const data = await handleRequest(base64Image);
    return NextResponse.json(data);

  } catch (error) {
    logger.error('Error in API route', { error });
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

const handleRequest = wrapTraced(async function handleRequest(base64Image: string) {
  try {
    const result = await invoke({
      projectName: "docbase",
      slug: "parse-signature-block",
      input: {
        base64Image,
      },
      stream: false,
    });
    return result;
  } catch (error) {
    logger.error('Error in handleRequest', { error });
    throw error;
  }
});