import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Password updated successfully' })
}