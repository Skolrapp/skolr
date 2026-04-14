import { NextRequest, NextResponse } from 'next/server';
import { extname } from 'path';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const BRANDING_BUCKET = process.env.SUPABASE_BRANDING_BUCKET || 'site-branding';
const MAX_BANNER_SIZE = 8 * 1024 * 1024;
const BANNER_SLOTS = ['hero-banner', 'campaign-banner', 'message-placeholder-1', 'message-placeholder-2', 'message-placeholder-3'] as const;

async function ensureBrandingBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === BRANDING_BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(BRANDING_BUCKET, {
      public: true,
      fileSizeLimit: MAX_BANNER_SIZE,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    });
  }

  return supabase;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const slot = String(formData.get('slot') || '');

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'No banner image provided.' }, { status: 400 });
  }

  if (!BANNER_SLOTS.includes(slot as (typeof BANNER_SLOTS)[number])) {
    return NextResponse.json({ success: false, error: 'Invalid banner slot.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ success: false, error: 'Please upload an image file.' }, { status: 400 });
  }

  if (file.size > MAX_BANNER_SIZE) {
    return NextResponse.json({ success: false, error: 'Banner image must be 8MB or smaller.' }, { status: 400 });
  }

  const supabase = await ensureBrandingBucket();
  const { data: existingFiles } = await supabase.storage.from(BRANDING_BUCKET).list('landing', { limit: 20 });
  const oldBannerPaths = (existingFiles || [])
    .filter((entry) => entry.name.startsWith(slot))
    .map((entry) => `landing/${entry.name}`);

  if (oldBannerPaths.length > 0) {
    await supabase.storage.from(BRANDING_BUCKET).remove(oldBannerPaths);
  }

  const extension = extname(file.name) || '.jpg';
  const path = `landing/${slot}${extension.toLowerCase()}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BRANDING_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    success: true,
    data: {
      banner_url: data.publicUrl,
      slot,
      bucket: BRANDING_BUCKET,
      path,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const slot = String(searchParams.get('slot') || '');

  if (!BANNER_SLOTS.includes(slot as (typeof BANNER_SLOTS)[number])) {
    return NextResponse.json({ success: false, error: 'Invalid banner slot.' }, { status: 400 });
  }

  const supabase = await ensureBrandingBucket();
  const { data: existingFiles } = await supabase.storage.from(BRANDING_BUCKET).list('landing', { limit: 50 });
  const bannerPaths = (existingFiles || [])
    .filter((entry) => entry.name.startsWith(slot))
    .map((entry) => `landing/${entry.name}`);

  if (bannerPaths.length === 0) {
    return NextResponse.json({ success: true, data: { slot, removed: false } });
  }

  const { error } = await supabase.storage.from(BRANDING_BUCKET).remove(bannerPaths);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      slot,
      removed: true,
    },
  });
}
