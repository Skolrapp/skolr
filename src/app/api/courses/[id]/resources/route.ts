import { NextRequest, NextResponse } from 'next/server';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const RESOURCE_BUCKET = process.env.SUPABASE_RESOURCE_BUCKET || 'course-resources';
const MAX_RESOURCE_SIZE = 25 * 1024 * 1024;

async function ensureResourceBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === RESOURCE_BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(RESOURCE_BUCKET, {
      public: true,
      fileSizeLimit: MAX_RESOURCE_SIZE,
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/webp',
      ],
    });
  }

  return supabase;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data } = await supabase.from('course_resources').select('*').eq('course_id', id).order('created_at', { ascending: true });
  const chapterIds = Array.from(new Set((data || []).map((resource: any) => resource.chapter_id).filter(Boolean)));
  let chapterTitleMap: Record<string, string> = {};

  if (chapterIds.length > 0) {
    const { data: chapterRows } = await supabase.from('chapters').select('id, title').in('id', chapterIds);
    chapterTitleMap = Object.fromEntries((chapterRows || []).map((chapter: any) => [chapter.id, chapter.title]));
  }

  return NextResponse.json({
    success: true,
    data: (data || []).map((resource: any) => ({
      ...resource,
      chapter_title: resource.chapter_id ? chapterTitleMap[resource.chapter_id] || null : null,
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'instructor' && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Only instructors can add resources.' }, { status: 403 });
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data: course } = await supabase.from('courses').select('id, instructor_id').eq('id', id).single();
  if (!course || (course.instructor_id !== session.user.id && session.user.role !== 'admin')) return NextResponse.json({ success: false, error: 'Not your course.' }, { status: 403 });

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') || '').trim();
    const type = String(formData.get('type') || 'note').trim();
    const description = String(formData.get('description') || '').trim();
    const chapterIdRaw = String(formData.get('chapter_id') || '').trim();
    const chapterId = chapterIdRaw || null;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title required.' }, { status: 400 });
    }

    if (chapterId) {
      const { data: chapter } = await supabase.from('chapters').select('id').eq('id', chapterId).eq('course_id', id).single();
      if (!chapter) {
        return NextResponse.json({ success: false, error: 'Selected chapter does not belong to this course.' }, { status: 400 });
      }
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Attach a file to upload.' }, { status: 400 });
    }

    if (file.size > MAX_RESOURCE_SIZE) {
      return NextResponse.json({ success: false, error: 'Resource must be 25MB or smaller.' }, { status: 400 });
    }

    const storageClient = await ensureResourceBucket();
    const extension = extname(file.name) || '.bin';
    const path = `${session.user.id}/${id}/${uuidv4()}${extension.toLowerCase()}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await storageClient.storage
      .from(RESOURCE_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = storageClient.storage.from(RESOURCE_BUCKET).getPublicUrl(path);
    const { data, error } = await storageClient
      .from('course_resources')
      .insert({
        course_id: id,
        chapter_id: chapterId,
        title,
        type: type || 'note',
        url: publicData.publicUrl,
        description: description || file.name,
        created_by: session.user.id,
        storage_bucket: RESOURCE_BUCKET,
        storage_path: path,
        mime_type: file.type || null,
        file_size_bytes: file.size,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message.includes('chapter_id') || error.message.includes('storage_')
          ? 'Run the Supabase SQL for course resource uploads, then try again.'
          : error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        chapter_title: null,
      },
    }, { status: 201 });
  }

  const { title, type, url, description, chapter_id } = await request.json() as { title: string; type: string; url?: string; description?: string; chapter_id?: string | null };
  if (!title?.trim()) return NextResponse.json({ success: false, error: 'Title required.' }, { status: 400 });

  if (chapter_id) {
    const { data: chapter } = await supabase.from('chapters').select('id').eq('id', chapter_id).eq('course_id', id).single();
    if (!chapter) {
      return NextResponse.json({ success: false, error: 'Selected chapter does not belong to this course.' }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('course_resources')
    .insert({ course_id: id, chapter_id: chapter_id || null, title: title.trim(), type: type || 'note', url: url || null, description: description || null, created_by: session.user.id })
    .select()
    .single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
