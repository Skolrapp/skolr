import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (body.role !== undefined) updates.role = body.role;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  if (body.password) {
    if (String(body.password).length < 6) {
      return NextResponse.json({ success: false, error: 'Temporary password must be at least 6 characters.' }, { status: 400 });
    }
    updates.password_hash = await bcrypt.hash(String(body.password), 12);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'No changes supplied.' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, name, phone, role, is_active, subscription_tier, created_at')
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
