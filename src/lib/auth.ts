import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSupabaseAdmin } from './supabase/server';
import type { User, Device } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'skolr-dev-secret-CHANGE-IN-PRODUCTION-32chars!!'
);
const SESSION_HOURS = 24 * 7; // 7 days
const MAX_DEVICES   = 2;

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function signToken(payload: { userId: string; role: string; sessionId: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string; sessionId: string };
  } catch { return null; }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

// ─── Session management ───────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  role: string,
  deviceInfo: { fingerprint: string; deviceName: string; os: string; browser: string; ipAddress: string }
): Promise<{ token: string; sessionId: string }> {
  const supabase = createSupabaseAdmin();

  // SINGLE-SESSION: invalidate all prior sessions
  await supabase
    .from('user_sessions')
    .update({ is_valid: false })
    .eq('user_id', userId)
    .eq('is_valid', true);

  // Register or update device
  const { data: existingDevice } = await supabase
    .from('user_devices')
    .select('id')
    .eq('user_id', userId)
    .eq('fingerprint', deviceInfo.fingerprint)
    .single();

  let deviceId: string;

  if (existingDevice) {
    deviceId = existingDevice.id;
    await supabase
      .from('user_devices')
      .update({ last_active: new Date().toISOString(), ip_address: deviceInfo.ipAddress })
      .eq('id', deviceId);
  } else {
    // Enforce device limit
    const { count } = await supabase
      .from('user_devices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count ?? 0) >= MAX_DEVICES) {
      throw new Error('DEVICE_LIMIT_EXCEEDED');
    }

    deviceId = uuidv4();
    await supabase.from('user_devices').insert({
      id: deviceId,
      user_id: userId,
      fingerprint: deviceInfo.fingerprint,
      device_name: deviceInfo.deviceName,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      ip_address: deviceInfo.ipAddress,
    });
  }

  // Create session
  const sessionId = uuidv4();
  const token     = await signToken({ userId, role, sessionId });
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();

  await supabase.from('user_sessions').insert({
    id: sessionId,
    user_id: userId,
    token_hash: tokenHash,
    device_id: deviceId,
    ip_address: deviceInfo.ipAddress,
    is_valid: true,
    expires_at: expiresAt,
  });

  return { token, sessionId };
}

export async function validateSession(token: string): Promise<{ user: User } | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;

  const supabase = createSupabaseAdmin();
  const tokenHash = hashToken(token);

  const { data: session } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('is_valid', true)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!session) return null;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', payload.userId)
    .eq('is_active', true)
    .single();

  if (!user) return null;
  return { user: user as User };
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sk_token')?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user ?? null;
}

export function invalidateSession(token: string) {
  const supabase = createSupabaseAdmin();
  const tokenHash = hashToken(token);
  return supabase
    .from('user_sessions')
    .update({ is_valid: false })
    .eq('token_hash', tokenHash);
}

export async function getUserDevices(userId: string, currentFingerprint?: string): Promise<Device[]> {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_active', { ascending: false });

  return (data || []).map(d => ({ ...d, is_current: currentFingerprint ? d.fingerprint === currentFingerprint : false }));
}

export async function removeDevice(userId: string, deviceId: string) {
  const supabase = createSupabaseAdmin();
  await supabase.from('user_sessions').update({ is_valid: false }).eq('device_id', deviceId);
  await supabase.from('user_devices').delete().eq('id', deviceId).eq('user_id', userId);
}

export function getDeviceFingerprint(request: NextRequest): string {
  const ua   = request.headers.get('user-agent') || '';
  const lang = request.headers.get('accept-language') || '';
  return createHash('sha256').update(`${ua}|${lang}`).digest('hex').substring(0, 32);
}
