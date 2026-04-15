import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  if (token) await invalidateSession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.delete('sk_token');
  res.cookies.delete('sk_active_learner');
  return res;
}
