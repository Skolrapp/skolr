import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { avatar_url } = await request.json() as { avatar_url: string };
  if (!avatar_url) return NextResponse.json({ success: false, error: 'No avatar URL.' }, { status: 400 });
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('users').update({ avatar_url }).eq('id', session.user.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, avatar_url });
}
