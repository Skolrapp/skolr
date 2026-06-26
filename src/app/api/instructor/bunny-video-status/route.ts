import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getBunnyPlaybackStatus } from '@/lib/bunny/status';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can check Bunny status.' }, { status: 403 });
  }

  const videoId = request.nextUrl.searchParams.get('videoId') || '';
  const hlsUrl = request.nextUrl.searchParams.get('hlsUrl') || '';

  if (!hlsUrl) {
    return NextResponse.json({ success: false, error: 'hlsUrl is required.' }, { status: 400 });
  }

  const status = await getBunnyPlaybackStatus(videoId, hlsUrl);
  return NextResponse.json({ success: true, data: status });
}
