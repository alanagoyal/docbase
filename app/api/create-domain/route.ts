import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const { domainName, apiKey } = await req.json();
  console.log(`Attempting to create domain: ${domainName}`);

  const resend = new Resend(apiKey);

  try {
    console.log('Calling resend.domains.create');
    const createResult = await resend.domains.create({ name: domainName });
    console.log('Domain creation result:', createResult);

    if (createResult.error) {
      throw createResult.error;
    }

    return NextResponse.json({ id: createResult.data?.id });
  } catch (error: any) {
    console.error('Error creating domain:', error);

    if (error.statusCode === 403 && error.name === 'validation_error' && error.message.includes('has been registered already')) {
      console.log('Domain already registered, fetching list of domains');
      const listResult = await resend.domains.list();
      console.log('Domains list result:', listResult);

      if (listResult.error) {
        throw listResult.error;
      }

      // Adjust this line to access the correct data structure
      const domains = listResult?.data?.data;
      console.log('Domains fetched:', domains);

      const existingDomain = domains?.find((d: any) => d.name === domainName);
      
      if (existingDomain) {
        console.log('Existing domain found:', existingDomain);
        return NextResponse.json({ id: existingDomain.id });
      } else {
        console.log('Existing domain not found in the list');
        throw new Error('Domain not found after creation attempt');
      }
    }
    
    // If not a domain already registered error or domain not found in the list
    console.log('Returning error response');
    return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
  }
}