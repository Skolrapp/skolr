import { NextRequest, NextResponse } from 'next/server';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const THUMBNAIL_BUCKET = process.env.SUPABASE_THUMBNAIL_BUCKET || 'course-thumbnails';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

async function ensureBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === THUMBNAIL_BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(THUMBNAIL_BUCKET, {
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

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can upload thumbnails.' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'No thumbnail file provided.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ success: false, error: 'Please upload an image file.' }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ success: false, error: 'Thumbnail must be 5MB or smaller.' }, { status: 400 });
  }

  const supabase = await ensureBucket();
  const extension = extname(file.name) || '.jpg';
  const path = `${session.user.id}/${uuidv4()}${extension.toLowerCase()}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    success: true,
    data: {
      thumbnail_url: data.publicUrl,
      bucket: THUMBNAIL_BUCKET,
      path,
    },
  });
}
