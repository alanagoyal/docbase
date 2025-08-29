import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { validate as isUuid } from 'uuid';
import { Resend } from 'resend';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const sendViewLinkSchema = z.object({
  email: z.string().email(),
  linkId: z.string().uuid(),
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build-placeholder.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'build-placeholder';
const resendApiKey = process.env.RESEND_API_KEY || 'build-placeholder';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Access auth admin API
const adminAuthClient = supabase.auth.admin;
const resend = new Resend(resendApiKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = sendViewLinkSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, linkId } = validationResult.data

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      logger.error('NEXT_PUBLIC_SITE_URL is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const redirectTo = `${siteUrl}/links/view/${linkId}`;

    const { data, error } = await adminAuthClient.generateLink({
      email,
      type: 'magiclink',
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      logger.error('Supabase error', { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || !data.properties || !data.properties.action_link) {
      logger.error('No action link generated');
      return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
    }

    const tokenHash = data.properties.hashed_token;
    const constructedLink = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=magiclink&next=${encodeURIComponent(redirectTo)}`;

    // Send the email with Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Docbase <hi@basecase.vc>',
      to: email,
      subject: 'Your Docbase Link',
      html: `
        <h2>Access Your Document in Docbase</h2>
        <p>Follow <a href="${constructedLink}">this link</a> to view your document securely</p>
      `,
    });

    if (emailError) {
      logger.error('Resend error', { error: emailError });
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'View link sent successfully' });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    logger.error('Unexpected error', { error });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
