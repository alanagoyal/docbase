import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const { name, apiKey } = await req.json();

  const resend = new Resend(apiKey);

  try {
    const domain = await resend.domains.create({ name });
    return NextResponse.json({ domain });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}