import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getInstructorEarnings } from '@/lib/payments';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  const period = (request.nextUrl.searchParams.get('period') || 'month') as 'month' | 'quarter' | 'year';
  const data   = await getInstructorEarnings(session.user.id, period);
  return NextResponse.json({ success: true, data });
}
