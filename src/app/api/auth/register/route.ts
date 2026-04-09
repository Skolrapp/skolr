import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, role = 'student' } = await request.json() as { name: string; phone: string; password: string; role?: string };
    if (!name?.trim() || !phone?.trim() || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'All fields required. Password min 6 characters.' }, { status: 400 });
    }
    const normalized = phone.startsWith('+255') ? phone : `+255${phone.replace(/^0/, '')}`;
    const supabase   = createSupabaseAdmin();
    const { data: existing } = await supabase.from('users').select('id').eq('phone', normalized).single();
    if (existing) return NextResponse.json({ success: false, error: 'Phone number already registered.' }, { status: 409 });
    const hash = await bcrypt.hash(password, 12);
    const { error } = await supabase.from('users').insert({ id: uuidv4(), name: name.trim(), phone: normalized, password_hash: hash, role, subscription_tier: 'free' });
    if (error) return NextResponse.json({ success: false, error: 'Registration failed.' }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ success: false, error: 'Registration failed.' }, { status: 500 });
  }
}
