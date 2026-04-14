import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

function deriveTitle(sourceTitle: string, sourceSubject: string, targetSubject: string) {
  if (sourceTitle.toLowerCase().includes(sourceSubject.toLowerCase())) {
    const pattern = new RegExp(sourceSubject, 'ig');
    return sourceTitle.replace(pattern, targetSubject);
  }
  return `${targetSubject} - ${sourceTitle}`;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, subject, category, sub_category, created_at, users!instructor_id(name)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    data: (data || []).map((course: any) => ({
      ...course,
      instructor_name: course.users?.name || 'Unknown',
      users: undefined,
    })),
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const body = await request.json() as {
    sourceCourseId?: string;
    targetSubjects?: string[];
    targetSubCategory?: string | null;
    clonePublishedState?: boolean;
  };

  if (!body.sourceCourseId || !body.targetSubjects?.length) {
    return NextResponse.json({ success: false, error: 'Choose a template course and at least one target subject.' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: sourceCourse, error: sourceError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', body.sourceCourseId)
    .single();

  if (sourceError || !sourceCourse) {
    return NextResponse.json({ success: false, error: 'Template course not found.' }, { status: 404 });
  }

  const [{ data: chapters }, { data: resources }] = await Promise.all([
    supabase.from('chapters').select('*').eq('course_id', sourceCourse.id).order('order_index', { ascending: true }),
    supabase.from('course_resources').select('*').eq('course_id', sourceCourse.id).order('created_at', { ascending: true }),
  ]);

  const created: Array<{ id: string; title: string; subject: string }> = [];

  for (const subject of body.targetSubjects) {
    const newCourseId = uuidv4();
    const newTitle = deriveTitle(sourceCourse.title, sourceCourse.subject, subject);

    const { error: insertCourseError } = await supabase.from('courses').insert({
      id: newCourseId,
      title: newTitle,
      description: sourceCourse.description,
      category: sourceCourse.category,
      sub_category: body.targetSubCategory ?? sourceCourse.sub_category,
      subject,
      instructor_id: sourceCourse.instructor_id,
      thumbnail_url: sourceCourse.thumbnail_url,
      video_hls_url: sourceCourse.video_hls_url,
      duration_seconds: sourceCourse.duration_seconds,
      language: sourceCourse.language,
      is_published: !!body.clonePublishedState && sourceCourse.is_published,
    });

    if (insertCourseError) {
      return NextResponse.json({ success: false, error: insertCourseError.message }, { status: 500 });
    }

    if ((chapters || []).length > 0) {
      const chapterIdMap: Record<string, string> = {};
      const clonedChapters = (chapters || []).map((chapter: any, index: number) => {
        const newChapterId = uuidv4();
        chapterIdMap[chapter.id] = newChapterId;
        return {
        id: newChapterId,
        course_id: newCourseId,
        title: deriveTitle(chapter.title, sourceCourse.subject, subject),
        description: chapter.description,
        video_hls_url: chapter.video_hls_url,
        duration_seconds: chapter.duration_seconds,
        order_index: index,
        is_published: chapter.is_published,
      };});
      const { error: chaptersError } = await supabase.from('chapters').insert(clonedChapters);
      if (chaptersError) {
        return NextResponse.json({ success: false, error: chaptersError.message }, { status: 500 });
      }
      if ((resources || []).length > 0) {
        const clonedResources = (resources || []).map((resource: any) => ({
          course_id: newCourseId,
          chapter_id: resource.chapter_id ? chapterIdMap[resource.chapter_id] || null : null,
          title: deriveTitle(resource.title, sourceCourse.subject, subject),
          type: resource.type,
          url: resource.url,
          description: resource.description,
          created_by: session.user.id,
          storage_bucket: resource.storage_bucket || null,
          storage_path: resource.storage_path || null,
          mime_type: resource.mime_type || null,
          file_size_bytes: resource.file_size_bytes || null,
        }));
        const { error: resourcesError } = await supabase.from('course_resources').insert(clonedResources);
        if (resourcesError) {
          return NextResponse.json({ success: false, error: resourcesError.message }, { status: 500 });
        }
      }
    } else if ((resources || []).length > 0) {
      const clonedResources = (resources || []).map((resource: any) => ({
        course_id: newCourseId,
        chapter_id: null,
        title: deriveTitle(resource.title, sourceCourse.subject, subject),
        type: resource.type,
        url: resource.url,
        description: resource.description,
        created_by: session.user.id,
        storage_bucket: resource.storage_bucket || null,
        storage_path: resource.storage_path || null,
        mime_type: resource.mime_type || null,
        file_size_bytes: resource.file_size_bytes || null,
      }));
      const { error: resourcesError } = await supabase.from('course_resources').insert(clonedResources);
      if (resourcesError) {
        return NextResponse.json({ success: false, error: resourcesError.message }, { status: 500 });
      }
    }

    created.push({ id: newCourseId, title: newTitle, subject });
  }

  return NextResponse.json({
    success: true,
    data: created,
    message: `Cloned the template into ${created.length} subject${created.length === 1 ? '' : 's'}. Replace video content before sending for review.`,
  });
}
