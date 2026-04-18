import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import { getActiveLearnerFromCookies } from '@/lib/activeLearner';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { Chapter, Course, EducationLevel, User } from '@/types';

const G = '#10B981';

const LEVEL_META: Record<EducationLevel, { label: string; color: string; bg: string }> = {
  primary: { label: 'Primary', color: '#2563eb', bg: '#eff6ff' },
  secondary: { label: 'Secondary', color: '#7c3aed', bg: '#f5f3ff' },
  highschool: { label: 'High School', color: '#d97706', bg: '#fffbeb' },
  undergraduate: { label: 'Undergraduate', color: '#059669', bg: '#ecfdf5' },
  masters: { label: 'Masters', color: '#dc2626', bg: '#fef2f2' },
};

type ReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  user_name?: string;
};

function formatDuration(seconds: number) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${totalMinutes} min`;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function getOutcomeBullets(course: Course, chapterCount: number) {
  const levelLabel = LEVEL_META[course.category]?.label || course.category;
  return [
    `Study ${course.subject} in a structured ${levelLabel.toLowerCase()} path instead of jumping between scattered clips.`,
    `Move through ${chapterCount || 1} clear lesson${chapterCount === 1 ? '' : 's'} with exam-focused pacing.`,
    `Follow one teacher's explanation style from introduction to revision.`,
    `Use quizzes, progress tracking, and learner switching when the account is managed by a parent.`,
  ];
}

async function getCourseDetail(id: string, user: User | null) {
  const supabase = createSupabaseAdmin();
  const { data: courseRow, error } = await supabase
    .from('courses')
    .select('*, users!instructor_id(name)')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error || !courseRow) return null;

  const course = {
    ...courseRow,
    instructor_name: (courseRow.users as { name?: string } | null)?.name || 'Unknown instructor',
    users: undefined,
  } as unknown as Course & { instructor_name: string };

  const [{ data: chapters }, { data: reviewRows }] = await Promise.all([
    supabase
      .from('chapters')
      .select('*')
      .eq('course_id', id)
      .eq('is_published', true)
      .order('order_index', { ascending: true }),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users(name)')
      .eq('course_id', id)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  let activeLearnerName: string | null = null;
  let enrolled = false;
  let progressSeconds = 0;

  if (user) {
    const { activeLearner } = await getActiveLearnerFromCookies(user);
    activeLearnerName = activeLearner?.full_name || null;

    let enrollmentQuery = supabase
      .from('enrollments')
      .select('progress_seconds')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .order('enrolled_at', { ascending: false })
      .limit(1);

    enrollmentQuery = activeLearner?.id
      ? enrollmentQuery.eq('learner_profile_id', activeLearner.id)
      : enrollmentQuery.is('learner_profile_id', null);

    const { data: enrollment } = await enrollmentQuery.maybeSingle();
    enrolled = !!enrollment;
    progressSeconds = Number(enrollment?.progress_seconds || 0);
  }

  const reviews = ((reviewRows || []) as Array<Record<string, unknown> & { users?: { name?: string } | null }>).map((row) => ({
    id: String(row.id),
    rating: Number(row.rating || 0),
    comment: (row.comment as string | null) || null,
    created_at: String(row.created_at),
    user_name: row.users?.name || 'Student',
  })) as ReviewItem[];

  const averageRating = reviews.length
    ? Math.round((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return {
    course,
    chapters: (chapters || []) as Chapter[],
    reviews,
    averageRating,
    activeLearnerName,
    enrolled,
    progressSeconds,
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from('courses')
    .select('title, description, subject, category, sub_category')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (!data) {
    return {
      title: 'Course not found',
    };
  }

  const title = `${data.title} | ${data.subject} ${data.sub_category ? `- ${data.sub_category}` : ''}`;
  const description = data.description || `Explore this ${data.category} ${data.subject} course on Skolr before starting your free trial.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/courses/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://skolr.co.tz/courses/${id}`,
    },
  };
}

export default async function CourseDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  const detail = await getCourseDetail(id, session?.user || null);

  if (!detail) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f8fa', padding: '60px 24px', fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 24, background: '#fff', border: '1px solid #e5e7eb', padding: 28, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Course not found</h1>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 20 }}>This class may be unpublished or no longer available.</p>
          <Link href="/courses" style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 999, background: G, color: '#fff', textDecoration: 'none', fontWeight: 800 }}>Browse other courses</Link>
        </div>
      </div>
    );
  }

  const { course, chapters, reviews, averageRating, activeLearnerName, enrolled, progressSeconds } = detail;
  const user = session?.user || null;
  const levelMeta = LEVEL_META[course.category] || LEVEL_META.primary;
  const outcomes = getOutcomeBullets(course, chapters.length);
  const hasActiveSubscription = !!user && isSubscriptionActive(user.subscription_expires_at);
  const hasAccess = !!user && hasActiveSubscription && canAccessLevel(user.subscription_tier, course.category);

  let primaryHref = '/register';
  let primaryLabel = 'Start free trial';
  let secondaryHref = '/pricing';
  let secondaryLabel = 'View plans';

  if (user) {
    if (hasAccess) {
      primaryHref = `/watch/${course.id}`;
      primaryLabel = enrolled || progressSeconds > 0 ? 'Resume class' : 'Open class';
      secondaryHref = '/courses';
      secondaryLabel = 'Browse more classes';
    } else {
      primaryHref = '/settings?tab=plans';
      primaryLabel = user.account_type === 'parent_guardian' ? 'Unlock for learner' : 'Unlock this class';
      secondaryHref = `/watch/${course.id}`;
      secondaryLabel = 'Go to lesson page';
    }
  } else {
    secondaryHref = '/login';
    secondaryLabel = 'Log in';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: '#0a0a0a', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(14px)', background: 'rgba(247,248,250,0.88)', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/courses" style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid #dbe0e7', color: '#334155', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Browse classes</Link>
            <Link href={primaryHref} style={{ padding: '10px 16px', borderRadius: 999, background: G, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{primaryLabel}</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px 80px' }}>
        <section className="course-detail-hero" style={{ display: 'grid', gridTemplateColumns: '1.32fr 0.68fr', gap: 20, alignItems: 'stretch', marginBottom: 24 }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '24px 24px 28px', background: 'linear-gradient(140deg,#08110e,#0d1724 42%,#0f3a2a)', minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(16,185,129,0.22), transparent 36%), radial-gradient(circle at bottom left, rgba(59,130,246,0.18), transparent 32%)' }} />
            {course.thumbnail_url && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(135deg, rgba(2,6,23,0.72), rgba(2,6,23,0.32)), url(${course.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 0.4 }}>{levelMeta.label}</span>
                {course.sub_category && <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.18)', color: '#d1fae5', fontSize: 11, fontWeight: 800 }}>{course.sub_category}</span>}
                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 800 }}>{chapters.length || 1} lesson{chapters.length === 1 ? '' : 's'}</span>
              </div>
              <h1 style={{ fontSize: 38, lineHeight: 1.08, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                {course.title}
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.68, color: 'rgba(255,255,255,0.78)', maxWidth: 580, marginBottom: 20 }}>
                {course.description || `Explore how Skolr teaches ${course.subject} through structured lessons, guided examples, and a clear chapter order before you commit to a subscription.`}
              </p>
              <div className="course-detail-hero-stats" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  [formatDuration(course.duration_seconds || 0), 'Estimated study time'],
                  [averageRating ? `${averageRating} / 5` : 'New', 'Learner rating'],
                  [course.subject, 'Subject focus'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{value}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="course-detail-hero-actions" style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <Link href={primaryHref} style={{ padding: '14px 18px', borderRadius: 14, background: '#fff', color: '#0a0a0a', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>{primaryLabel}</Link>
              <Link href="#lesson-outline" style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>See lesson outline</Link>
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', boxShadow: '0 18px 50px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/10', background: 'linear-gradient(135deg,#def7ec,#eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(16,185,129,0.14)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill={G}><path d="M8 5v14l11-7z" /></svg>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#0f172a', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                  {user ? 'Open lesson flow' : 'Create account to continue'}
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6 }}>Instructor</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginTop: 3 }}>{course.instructor_name}</p>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    {course.instructor_name.charAt(0)}
                  </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', marginBottom: 16 }}>
                  A focused lesson path with clear chapters, progress tracking, and exam-oriented pacing.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ padding: '7px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700 }}>Structured path</span>
                  <span style={{ padding: '7px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700 }}>Progress tracking</span>
                  <span style={{ padding: '7px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700 }}>Quiz-ready</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="course-detail-body" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ borderRadius: 22, background: '#fff', border: '1px solid #e6eaf0', padding: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>What learners will achieve</p>
              <div className="course-detail-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                {outcomes.map((item) => (
                  <div key={item} style={{ borderRadius: 18, padding: '16px 16px 16px 14px', background: '#f8fafc', border: '1px solid #ecf0f4', display: 'flex', gap: 12 }}>
                    <div style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 999, background: '#dcfce7', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>✓</div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#334155' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="lesson-outline" style={{ borderRadius: 22, background: '#fff', border: '1px solid #e6eaf0', padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Lesson outline</p>
                  <h2 style={{ fontSize: 28, lineHeight: 1.12, fontWeight: 900, color: '#0a0a0a', margin: 0 }}>Lesson outline</h2>
                </div>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{chapters.length || 1} chapter{chapters.length === 1 ? '' : 's'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(chapters.length ? chapters : [{
                  id: 'intro',
                  title: course.title,
                  description: course.description || '',
                  duration_seconds: course.duration_seconds || 0,
                } as Partial<Chapter>]).map((lesson, index) => (
                  <div key={lesson.id || `${course.id}-${index}`} style={{ borderRadius: 18, padding: '14px 16px', background: index < 2 ? '#f0fdf4' : '#f8fafc', border: `1px solid ${index < 2 ? '#bbf7d0' : '#ecf0f4'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: index < 2 ? '#10B981' : '#e2e8f0', color: index < 2 ? '#fff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0a0a0a' }}>{lesson.title || `Lesson ${index + 1}`}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                          {formatDuration(Number(lesson.duration_seconds || 0))} • {index < 2 ? 'Preview-friendly' : 'Full lesson'}
                        </p>
                      </div>
                    </div>
                    <span style={{ padding: '10px 14px', borderRadius: 999, border: index < 2 ? 'none' : '1px solid #dbe3eb', background: index < 2 ? '#0a0a0a' : '#fff', color: index < 2 ? '#fff' : '#475569', fontSize: 12, fontWeight: 800 }}>
                      {index < 2 ? 'Open from class page' : 'Continue after unlock'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 22, background: '#fff', border: '1px solid #e6eaf0', padding: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Social proof</p>
              <h2 style={{ fontSize: 28, lineHeight: 1.12, fontWeight: 900, color: '#0a0a0a', margin: '0 0 16px' }}>Learner reviews</h2>
              <div className="course-detail-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
                {(reviews.length ? reviews : [{
                  id: 'placeholder-1',
                  rating: 5,
                  comment: 'This is where real learner and parent feedback will appear once more classes collect reviews.',
                  created_at: new Date().toISOString(),
                  user_name: 'Skolr learner',
                }]).map((review) => (
                  <div key={review.id} style={{ borderRadius: 18, padding: 18, background: '#f8fafc', border: '1px solid #ecf0f4' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0a0a0a' }}>{review.user_name || 'Student'}</p>
                    <p style={{ margin: '6px 0 10px', fontSize: 13, letterSpacing: 1, color: '#f59e0b' }}>{'★'.repeat(review.rating)}{'☆'.repeat(Math.max(0, 5 - review.rating))}</p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#475569' }}>{review.comment || 'Helpful class.'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ position: 'sticky', top: 94, borderRadius: 22, background: '#fff', border: '1px solid #e6eaf0', boxShadow: '0 18px 50px rgba(15,23,42,0.06)', padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Next step</p>
              <h3 style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: '#0a0a0a', margin: '0 0 8px' }}>
                {hasAccess ? 'Continue into the lesson flow' : user ? 'Unlock this class on your account' : 'Start free, then continue'}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', marginBottom: 18 }}>
                {hasAccess
                  ? 'You already have enough access to move from this detail page into the watch experience.'
                  : user
                    ? 'This class sits behind the subscription tier shown below. Once unlocked, you can move into the watch page and save progress there.'
                    : 'Create an account when you are ready to start learning and save progress.'}
              </p>
              <div style={{ borderRadius: 18, padding: 16, background: '#f8fafc', border: '1px solid #ecf0f4', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Class</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>{course.subject}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Level</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>{levelMeta.label}{course.sub_category ? ` · ${course.sub_category}` : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Current learner</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>{activeLearnerName || 'Choose after login'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href={primaryHref} style={{ display: 'block', padding: '14px 16px', borderRadius: 14, background: G, color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>{primaryLabel}</Link>
                <Link href={secondaryHref} style={{ display: 'block', padding: '14px 16px', borderRadius: 14, border: '1px solid #dbe3eb', background: '#fff', color: '#334155', fontSize: 14, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>{secondaryLabel}</Link>
              </div>
              <p style={{ marginTop: 12, fontSize: 12, lineHeight: 1.65, color: '#64748b' }}>
                {user?.account_type === 'parent_guardian'
                  ? 'Parent accounts subscribe once, then switch learner profiles without changing the subscription owner.'
                  : 'Progress, reviews, and saved lessons continue on the watch page after you enter the class.'}
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
