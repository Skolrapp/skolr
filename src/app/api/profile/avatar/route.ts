import { NextRequest, NextResponse } from 'next/server';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || 'profile-avatars';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

async function ensureBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === AVATAR_BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    });
  }

  return supabase;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No portrait file provided.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Please upload an image file.' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, error: 'Portrait must be 5MB or smaller.' }, { status: 400 });
    }

    const supabase = await ensureBucket();
    const extension = extname(file.name) || '.jpg';
    const path = `${session.user.id}/${uuidv4()}${extension.toLowerCase()}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const avatar_url = data.publicUrl;

    const { error } = await supabase.from('users').update({ avatar_url }).eq('id', session.user.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, avatar_url });
  }

  const { avatar_url } = await request.json() as { avatar_url: string };
  if (!avatar_url) return NextResponse.json({ success: false, error: 'No avatar URL.' }, { status: 400 });
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('users').update({ avatar_url }).eq('id', session.user.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, avatar_url });
}
