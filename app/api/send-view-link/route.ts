import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { validate as isUuid } from 'uuid';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Access auth admin API
const adminAuthClient = supabase.auth.admin;
console.log('adminAuthClient', adminAuthClient);

const resend = new Resend(resendApiKey);

export async function POST(request: Request) {
  try {
    const { email, linkId } = await request.json();

    // Validate input presence
    if (!email || !linkId) {
      console.error('Missing required fields:', { email, linkId });
      return NextResponse.json({ error: 'Email and linkId are required' }, { status: 400 });
    }

    // Validate UUID format
    if (!isUuid(linkId)) {
      console.error('Invalid UUID format for linkId:', linkId);
      return NextResponse.json({ error: 'Invalid linkId format' }, { status: 400 });
    }

    console.log('Received email:', email);
    console.log('Received linkId:', linkId);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_SITE_URL is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const redirectTo = `${siteUrl}/links/view/${linkId}`;
    console.log('Redirecting to:', redirectTo);

    const { data, error } = await adminAuthClient.generateLink({
      email,
      type: 'magiclink',
      options: {
        redirectTo: redirectTo,
      },
    });

    // Add more logging here
    console.log('Generated link data:', data);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || !data.properties || !data.properties.action_link) {
      console.error('No action link generated');
      return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
    }

    const tokenHash = data.properties.hashed_token;
    const constructedLink = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=magiclink&next=${encodeURIComponent(redirectTo)}`;
    console.log('Generated magic link:', constructedLink);

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
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    console.log('Email sent successfully:', emailData);
    return NextResponse.json({ message: 'View link sent successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
