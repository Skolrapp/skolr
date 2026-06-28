import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import SubtleBackButton from '@/components/ui/SubtleBackButton';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { FORM_FOUR_CLASS, FORM_FOUR_PRICE_TZS, FORM_FOUR_SUBJECTS, getLaunchSubjectBySlug } from '@/lib/launchCatalog';
import type { Course, EducationLevel } from '@/types';

type SubjectPageProps = {
  params: Promise<{ slug: string }>;
};

type SubjectCourse = Course & {
  instructor_name: string;
};

type InstructorCard = {
  id: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  education?: string | null;
  experience?: string | null;
  courseCount: number;
};

async function getSubjectData(slug: string) {
  const subject = getLaunchSubjectBySlug(slug);
  if (!subject) return null;

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from('courses')
    .select('*, users!instructor_id(id, name, avatar_url, bio, education, experience)')
    .eq('is_published', true)
    .eq('category', FORM_FOUR_CLASS.level)
    .eq('sub_category', FORM_FOUR_CLASS.subCategory || null)
    .eq('subject', subject.catalogSubject)
    .order('created_at', { ascending: false });

  const rows = (data || []) as Array<Partial<Course> & {
    users?: {
      id?: string;
      name?: string;
      avatar_url?: string | null;
      bio?: string | null;
      education?: string | null;
      experience?: string | null;
    } | null;
  }>;

  const courses: SubjectCourse[] = rows.map((course) => ({
    id: String(course.id || ''),
    title: String(course.title || 'Untitled lesson'),
    description: course.description,
    category: (course.category || FORM_FOUR_CLASS.level) as EducationLevel,
    sub_category: course.sub_category,
    subject: String(course.subject || subject.catalogSubject),
    instructor_id: String(course.instructor_id || ''),
    instructor_name: course.users?.name || 'Skolr instructor',
    thumbnail_url: course.thumbnail_url,
    video_hls_url: String(course.video_hls_url || ''),
    duration_seconds: Number(course.duration_seconds || 0),
    is_published: Boolean(course.is_published),
    language: course.language || 'en',
    view_count: Number(course.view_count || 0),
    review_status: course.review_status,
    admin_notes: course.admin_notes,
    created_at: String(course.created_at || ''),
  }));

  const instructorsMap = new Map<string, InstructorCard>();
  courses.forEach((course, index) => {
    const row = rows[index];
    const instructorId = String(row.users?.id || course.instructor_id || course.instructor_name);
    const existing = instructorsMap.get(instructorId);
    if (existing) {
      existing.courseCount += 1;
      return;
    }

    instructorsMap.set(instructorId, {
      id: instructorId,
      name: row.users?.name || course.instructor_name || 'Skolr instructor',
      bio: row.users?.bio || null,
      avatar_url: row.users?.avatar_url || null,
      education: row.users?.education || null,
      experience: row.users?.experience || null,
      courseCount: 1,
    });
  });

  return {
    subject,
    courses,
    instructors: Array.from(instructorsMap.values()),
  };
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = getLaunchSubjectBySlug(slug);

  if (!subject) {
    return {
      title: 'Subject | Skolr',
    };
  }

  return {
    title: `${subject.name} | Form Four | Skolr`,
    description: `${subject.description} Explore lessons and instructors for Form Four ${subject.name} on Skolr.`,
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (session?.user?.role === 'instructor') {
    redirect('/instructor');
  }

  const { slug } = await params;
  const data = await getSubjectData(slug);

  if (!data) notFound();

  const { subject, courses, instructors } = data;
  const relatedSubjects = FORM_FOUR_SUBJECTS.filter((entry) => entry.slug !== subject.slug).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7f5', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <section style={{ background: 'linear-gradient(135deg,#101413 0%,#16251f 54%,#0c7a55 100%)', padding: '34px 24px 52px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <SubtleBackButton fallbackHref="/courses?level=secondary&sub=Form%204" label="Back to subjects" light />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#24d366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>Skolr</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.62)' }}>Master Form Four. Pass with Confidence.</p>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/login" style={{ minHeight: 46, padding: '0 18px', borderRadius: 999, textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Log in
              </Link>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]" style={{ alignItems: 'stretch' }}>
            <div style={{ padding: '10px 0' }}>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9, color: '#a7f3d0', marginBottom: 10 }}>
                Form Four subject
              </p>
              <h1 style={{ fontSize: 'clamp(38px,5vw,66px)', lineHeight: 1, fontWeight: 900, color: '#fff', marginBottom: 14 }}>
                {subject.name}
              </h1>
              <p style={{ maxWidth: 700, fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.76)', marginBottom: 14 }}>
                {subject.description}
              </p>
              <p style={{ maxWidth: 640, fontSize: 15, lineHeight: 1.75, color: '#d1fae5', marginBottom: 24 }}>
                {subject.confidenceLine}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/register" style={{ minHeight: 52, padding: '0 22px', borderRadius: 16, textDecoration: 'none', color: '#062314', background: '#fff', fontSize: 14, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 34px rgba(0,0,0,0.16)' }}>
                  Start for Free
                </Link>
                <Link href={`/courses?level=${FORM_FOUR_CLASS.level}&sub=${encodeURIComponent(FORM_FOUR_CLASS.subCategory || '')}&subject=${encodeURIComponent(subject.catalogSubject)}`} style={{ minHeight: 52, padding: '0 22px', borderRadius: 16, textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  See all lessons
                </Link>
              </div>
            </div>

            <div style={{ borderRadius: 28, border: '1px solid rgba(255,255,255,0.12)', background: 'linear-gradient(180deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.06) 100%)', padding: 24, boxShadow: '0 22px 50px rgba(0,0,0,0.16)' }}>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9, color: '#bbf7d0', marginBottom: 12 }}>
                Subject overview
              </p>
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
                <div style={{ padding: 16, borderRadius: 20, background: 'rgba(15,23,42,0.26)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{courses.length}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>Published lessons</p>
                </div>
                <div style={{ padding: 16, borderRadius: 20, background: 'rgba(15,23,42,0.26)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{instructors.length}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>Visible instructors</p>
                </div>
                <div style={{ padding: 16, borderRadius: 20, background: 'rgba(15,23,42,0.26)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{FORM_FOUR_PRICE_TZS.toLocaleString()} TZS</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>Monthly access</p>
                </div>
                <div style={{ padding: 16, borderRadius: 20, background: 'rgba(15,23,42,0.26)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{FORM_FOUR_CLASS.name}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>Launch focus</p>
                </div>
              </div>
              <div style={{ padding: 18, borderRadius: 22, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.78)' }}>
                  Guests can inspect the lesson lineup, see the instructors teaching this subject, and move into the sign-up flow only when they are ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 24px 88px' }}>
        <section style={{ marginBottom: 24, borderRadius: 28, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 18px 44px rgba(15,23,42,0.05)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#04959d', marginBottom: 8 }}>Instructors</p>
              <h2 style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Meet the teachers behind {subject.name}.</h2>
              <p style={{ maxWidth: 720, fontSize: 15, lineHeight: 1.75, color: '#55616d' }}>
                Each instructor card opens into a fuller profile so parents and students can see who is teaching before subscribing.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {instructors.length ? instructors.map((instructor) => (
              <Link
                key={instructor.id}
                href={`/instructors/${instructor.id}`}
                style={{ textDecoration: 'none', color: 'inherit', borderRadius: 22, background: 'linear-gradient(180deg,#fbfdfb 0%,#f4f8f6 100%)', border: '1px solid #e5e7eb', padding: 18, boxShadow: '0 12px 28px rgba(15,23,42,0.04)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 62, height: 62, borderRadius: '50%', overflow: 'hidden', background: '#dcfce7', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {instructor.avatar_url ? (
                      <img src={instructor.avatar_url} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 22, fontWeight: 900, color: '#047857' }}>{instructor.name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 17, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{instructor.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>{instructor.courseCount} {instructor.courseCount === 1 ? 'lesson track' : 'lesson tracks'}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5b6570', marginBottom: 12 }}>
                  {instructor.bio || `${subject.name} instructor focused on clear explanations, calm pacing, and exam-readiness.`}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {instructor.education ? <span style={{ padding: '6px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>{instructor.education}</span> : null}
                  {instructor.experience ? <span style={{ padding: '6px 10px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 11, fontWeight: 700 }}>{instructor.experience}</span> : null}
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', borderRadius: 22, border: '1px dashed #cbd5e1', background: '#f8fafc', padding: '24px 20px' }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Instructor cards will appear here as soon as this subject is published.</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>The page structure is ready, so this subject can go live cleanly once the lesson content is attached.</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#04959d', marginBottom: 8 }}>Lessons</p>
              <h2 style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Open the {subject.name} lesson paths.</h2>
              <p style={{ maxWidth: 720, fontSize: 15, lineHeight: 1.75, color: '#55616d' }}>
                Visitors can review the available class options here first, then decide whether to continue into a free trial.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.length ? courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                style={{ textDecoration: 'none', color: 'inherit', borderRadius: 24, overflow: 'hidden', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 16px 36px rgba(15,23,42,0.05)' }}
              >
                <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg,#e7f7ee 0%,#dbeafe 100%)', overflow: 'hidden' }}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#047857' }}>
                      {subject.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 11, fontWeight: 800 }}>{FORM_FOUR_CLASS.name}</span>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#f4f4f5', color: '#3f3f46', fontSize: 11, fontWeight: 800 }}>{subject.name}</span>
                  </div>
                  <h3 style={{ fontSize: 18, lineHeight: 1.35, fontWeight: 900, color: '#111827', marginBottom: 8 }}>{course.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{course.instructor_name}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: '#4b5563', marginBottom: 14 }}>
                    {course.description || 'Open this lesson page to preview the course layout, meet the instructor, and see how the topic is taught.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>Open class preview</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{Math.max(1, Math.round((course.duration_seconds || 0) / 60))} min</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', borderRadius: 24, border: '1px dashed #cbd5e1', background: '#fff', padding: '30px 22px' }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 8 }}>No public {subject.name} lessons are published yet.</p>
                <p style={{ maxWidth: 680, fontSize: 14, lineHeight: 1.75, color: '#64748b', marginBottom: 14 }}>
                  The page is ready for launch. Once lessons are published in admin, they will appear here automatically with their instructors.
                </p>
              </div>
            )}
          </div>
        </section>

        <section style={{ borderRadius: 28, background: 'linear-gradient(135deg,#ffffff 0%,#f5faf8 100%)', border: '1px solid #deebe4', boxShadow: '0 16px 34px rgba(15,23,42,0.04)', padding: 24 }}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]" style={{ alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#04959d', marginBottom: 8 }}>Keep browsing</p>
              <h2 style={{ fontSize: 28, lineHeight: 1.12, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Explore more Form Four subjects.</h2>
              <p style={{ maxWidth: 720, fontSize: 14, lineHeight: 1.75, color: '#55616d' }}>
                Every public subject keeps the same calm structure so students and parents can compare paths without getting lost.
              </p>
            </div>
            <Link href="/courses?level=secondary&sub=Form%204" style={{ minHeight: 48, padding: '0 18px', borderRadius: 999, textDecoration: 'none', color: '#fff', background: '#111827', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Browse all subjects
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" style={{ marginTop: 18 }}>
            {relatedSubjects.map((entry) => (
              <Link key={entry.id} href={entry.href} style={{ textDecoration: 'none', color: 'inherit', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', padding: 18 }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 6 }}>{entry.name}</p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5b6570', marginBottom: 12 }}>{entry.confidenceLine}</p>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>Open subject page</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
