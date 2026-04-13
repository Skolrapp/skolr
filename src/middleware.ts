import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'skolr-dev-secret-CHANGE-IN-PRODUCTION-32chars!!'
);

const PUBLIC = ['/', '/landing', '/login', '/register', '/courses', '/pricing', '/api/auth/', '/api/courses', '/manifest.json', '/favicon.ico'];

async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string; sessionId: string };
  } catch { return null; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('sk_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Session expired.', code: 'SESSION_INVALID' }, { status: 401 });
    }
    const url = new URL('/login', request.url);
    url.searchParams.set('reason', 'session_ended');
    const res = NextResponse.redirect(url);
    res.cookies.delete('sk_token');
    return res;
  }

  if ((pathname.startsWith('/instructor') || pathname.startsWith('/api/instructor')) && payload.role === 'student') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL(payload.role === 'instructor' ? '/instructor' : '/dashboard', request.url));
  }

  const headers = new Headers(request.headers);
  headers.set('x-user-id',    payload.userId);
  headers.set('x-user-role',  payload.role);
  headers.set('x-session-id', payload.sessionId);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|screenshots).*)'],
};
