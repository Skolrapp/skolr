import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('reviews').select('*, users(name)').eq('course_id', id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const reviews = (data || []).map((r: any) => ({ ...r, user_name: r.users?.name || 'Student', users: undefined }));
  const avg = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0;
  return NextResponse.json({ success: true, data: { reviews, average: Math.round(avg * 10) / 10, total: reviews.length } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { rating, comment } = await request.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ success: false, error: 'Rating must be 1-5.' }, { status: 400 });
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('reviews').upsert({ id: uuidv4(), user_id: session.user.id, course_id: id, rating, comment: comment?.trim() || null }, { onConflict: 'user_id,course_id' }).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
