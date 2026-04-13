import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const adminToken = request.cookies.get('sk_admin_token')?.value;
  const res = NextResponse.json({ success: true });

  if (adminToken) {
    res.cookies.set('sk_token', adminToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  }

  res.cookies.delete('sk_admin_token');
  return res;
}
