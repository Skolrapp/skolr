import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getUserDevices, removeDevice, getDeviceFingerprint } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const fp      = getDeviceFingerprint(request);
  const devices = await getUserDevices(session.user.id, fp);
  return NextResponse.json({ success: true, data: devices });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { deviceId } = await request.json() as { deviceId: string };
  if (!deviceId) return NextResponse.json({ success: false, error: 'deviceId required.' }, { status: 400 });

  const fp      = getDeviceFingerprint(request);
  const devices = await getUserDevices(session.user.id, fp);
  const target  = devices.find(d => d.id === deviceId);

  if (!target)           return NextResponse.json({ success: false, error: 'Device not found.' }, { status: 404 });
  if (target.is_current) return NextResponse.json({ success: false, error: 'Cannot remove your current device.' }, { status: 400 });

  await removeDevice(session.user.id, deviceId);
  return NextResponse.json({ success: true });
}
