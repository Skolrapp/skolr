'use client';
import { useEffect, useState, useCallback, Suspense, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/player/VideoPlayer';
import ZealQuiz from '@/components/ai/ZealQuiz';
import Reviews from '@/components/ui/Reviews';
import { useAuth } from '@/hooks/useAuth';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import { LEVEL_COLORS } from '@/lib/constants';
import { saveProgressAction } from '@/actions/courses';
import Link from 'next/link';
import type { Course, Chapter } from '@/types';

const G = '#10B981';
type Tab = 'overview' | 'quiz' | 'reviews' | 'qa' | 'resources';

function fmtDur(s: number) {
  if (!s) return '';
  const m = Math.floor(s / 60);
  return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

const RES_ICONS: Record<string, string> = {
  note:     'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  link:     'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  pdf:      'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  video:    'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  exercise: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
};

function WatchContent() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [resources, setResources] = useState<any[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [showAddRes, setShowAddRes] = useState(false);
  const [resForm, setResForm] = useState({ title: '', type: 'note', url: '', description: '' });
  const [resError, setResError] = useState('');
  const [resPending, startResTransition] = useTransition();
  const [previewPromptOpen, setPreviewPromptOpen] = useState(false);
  const [instructorProfile, setInstructorProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/courses/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(async d => {
        if (!d.success) { router.push('/courses'); return; }
        setCourse(d.data.course);
        setProgress(d.data.progress_seconds || 0);
        const cr = await fetch('/api/courses/' + id + '/chapters', { credentials: 'include' });
        const cd = await cr.json();
        if (cd.success && cd.data.length > 0) { setChapters(cd.data); setActiveChapter(cd.data[0]); }
        if (d.data.course?.instructor_id) {
          fetch('/api/instructors/' + d.data.course.instructor_id, { credentials: 'include' })
            .then(r => r.json())
            .then(profileData => { if (profileData.success) setInstructorProfile(profileData.data); });
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!user || !course) return;
    const canManageCourse = user.role === 'admin' || course.instructor_id === user.id;
    if (canManageCourse) {
      setLocked(false);
      return;
    }
    const active = isSubscriptionActive(user.subscription_expires_at);
    setLocked(!active || !canAccessLevel(user.subscription_tier, course.category));
  }, [user, course]);

  useEffect(() => {
    if (tab !== 'resources') return;
    setResLoading(true);
    fetch('/api/courses/' + id + '/resources', { credentials: 'include' })
      .then(r => r.json()).then(d => { if (d.success) setResources(d.data); })
      .finally(() => setResLoading(false));
  }, [tab, id]);

  const handleProgress = useCallback(async (seconds: number) => {
    setProgress(seconds);
    if (!user) return;
    await saveProgressAction(id, seconds);
  }, [id, user]);

  const addResource = () => {
    setResError('');
    if (!resForm.title.trim()) { setResError('Title is required.'); return; }
    startResTransition(async () => {
      const res = await fetch('/api/courses/' + id + '/resources', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(resForm),
      });
      const data = await res.json();
      if (data.success) { setResources(r => [...r, data.data]); setResForm({ title: '', type: 'note', url: '', description: '' }); setShowAddRes(false); }
      else setResError(data.error || 'Failed.');
    });
  };

  if (loading) return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: G, animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  if (!course) return null;

  if (locked) return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>Subscription required</h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>This course requires a {course.category} plan.</p>
      <Link href="/settings" style={{ padding: '11px 24px', fontSize: 14, fontWeight: 700, color: '#fff', background: G, textDecoration: 'none', borderRadius: 8 }}>View plans</Link>
    </div>
  );

  const col = LEVEL_COLORS[course.category] || LEVEL_COLORS.primary;
  const currentVideo = activeChapter?.video_hls_url || course.video_hls_url;
  const currentTitle = activeChapter?.title || course.title;
  const totalDur = chapters.reduce((s, c) => s + c.duration_seconds, 0);
  const homeHref = !user ? '/' : user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard';
  const canManageCourse = !!user && (user.role === 'admin' || course.instructor_id === user.id);
  const isGuestPreview = !user;
  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'qa', label: 'Q&A' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <div className="watch-page" style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#0a0a0a' }}>

      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="watch-header" style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 60, padding: '0 24px' }}>
          <Link href={homeHref} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{course.title}</p>
          <div style={{ flex: 1 }} />
          <Link className="watch-home-link" href={homeHref} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#6b7280', textDecoration: 'none', borderRadius: 8, border: '1px solid #e5e7eb', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </Link>
          <div className="watch-user-chip" style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: G }}>{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div className="watch-layout" style={{ display: 'flex', alignItems: 'flex-start', maxWidth: 1440, margin: '0 auto' }}>

        <div className="watch-main" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: '#000' }}>
            <div className="watch-player-shell" style={{ maxWidth: 860, marginLeft: 0, position: 'relative' }}>
              <VideoPlayer
                hlsUrl={currentVideo}
                posterUrl={course.thumbnail_url}
                title={currentTitle}
                startAt={activeChapter ? 0 : progress}
                onProgress={handleProgress}
                previewSeconds={isGuestPreview ? 45 : 0}
                onPreviewLimit={() => setPreviewPromptOpen(true)}
              />
              {isGuestPreview && (
                <div className="watch-guest-pill" style={{ position: 'absolute', top: 16, right: 16, zIndex: 12, padding: '8px 12px', borderRadius: 999, background: 'rgba(17,24,39,0.82)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  Free preview: 45 seconds
                </div>
              )}
              {isGuestPreview && previewPromptOpen && (
                <div className="watch-preview-overlay" style={{ position: 'absolute', right: 18, bottom: 18, zIndex: 14, width: 320, maxWidth: 'calc(100% - 36px)', borderRadius: 18, background: 'rgba(255,255,255,0.96)', boxShadow: '0 18px 40px rgba(0,0,0,0.28)', padding: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: G, textTransform: 'uppercase', marginBottom: 8 }}>Keep learning on Skolr</p>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0a0a0a', lineHeight: 1.15, marginBottom: 8 }}>Create your free account to continue watching.</h3>
                  <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 14 }}>
                    You can already explore the chapters, instructor profile, and course overview. Sign up to unlock the full lesson and the rest of the class.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link href="/register" style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>Sign up free</Link>
                    <Link href="/login" style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#374151', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, textDecoration: 'none' }}>Log in</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="watch-meta" style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', maxWidth: 860 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 10 }}>{currentTitle}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: col.bg, color: col.color }}>{course.category}</span>
              {course.sub_category && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: col.bg, color: col.color }}>{course.sub_category}</span>}
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: '#f3f4f6', color: '#6b7280' }}>{course.subject}</span>
              {activeChapter?.duration_seconds ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: '#f3f4f6', color: '#6b7280' }}>{fmtDur(activeChapter.duration_seconds)}</span> : null}
            </div>
            {isGuestPreview && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: G, marginBottom: 5 }}>Guest preview mode</p>
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 10 }}>
                  Explore this class freely: skim the course outline, see who teaches it, and watch a short preview before you create a free account.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link href="/register" style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>Sign up free to continue</Link>
                  <Link href={`/courses?level=${course.category}${course.sub_category ? `&sub=${encodeURIComponent(course.sub_category)}` : ''}`} style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#374151', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, textDecoration: 'none' }}>See more in this class</Link>
                </div>
              </div>
            )}
            {canManageCourse && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                <Link
                  href={user?.role === 'admin' ? `/admin?tab=reviews` : `/instructor/courses/${course.id}/chapters`}
                  style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}
                >
                  {user?.role === 'admin' ? 'Back to review queue' : 'Manage chapters'}
                </Link>
                {user?.role !== 'admin' && (
                  <Link
                    href="/instructor"
                    style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#374151', background: '#f3f4f6', borderRadius: 999, textDecoration: 'none' }}
                  >
                    Return to instructor dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          {chapters.length > 0 && (
            <div className="watch-mobile-content">
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 4 }}>Course content</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>{chapters.length} chapters{totalDur ? ' · ' + fmtDur(totalDur) : ''}</p>
              </div>
              <div style={{ display: 'flex', overflowX: 'auto', gap: 10, padding: '12px 16px 16px', background: '#fff', scrollbarWidth: 'none' }}>
                {chapters.map((chapter, index) => {
                  const isCurrent = activeChapter?.id === chapter.id;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setActiveChapter(chapter)}
                      style={{
                        minWidth: 220,
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: '1px solid ' + (isCurrent ? '#10B981' : '#e5e7eb'),
                        background: isCurrent ? '#ecfdf5' : '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? '#059669' : '#9ca3af', marginBottom: 6 }}>Chapter {index + 1}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', lineHeight: 1.45, marginBottom: 6 }}>{chapter.title}</p>
                      {chapter.duration_seconds > 0 && <p style={{ fontSize: 11, color: '#6b7280' }}>{fmtDur(chapter.duration_seconds)}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="watch-tabs" style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 60, zIndex: 10 }}>
            <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', maxWidth: 860 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', color: tab === t.id ? '#0a0a0a' : '#9ca3af', cursor: 'pointer', borderBottom: '2px solid ' + (tab === t.id ? '#0a0a0a' : 'transparent'), whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="watch-tab-panel" style={{ padding: '28px 24px 60px', background: '#fff', minHeight: 400, maxWidth: 860 }}>
            {tab === 'overview' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>About this course</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>{course.description || 'No description available.'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: G }}>{(course.instructor_name || 'I').charAt(0)}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>Instructor</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>{course.instructor_name}</p>
                  </div>
                </div>
                {instructorProfile?.instructor && (
                  <div style={{ padding: 18, background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {instructorProfile.instructor.avatar_url
                          ? <img src={instructorProfile.instructor.avatar_url} alt={instructorProfile.instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 20, fontWeight: 800, color: G }}>{instructorProfile.instructor.name?.charAt(0)}</span>}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 3 }}>Instructor profile</p>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a' }}>{instructorProfile.instructor.name}</p>
                        <p style={{ fontSize: 13, color: '#6b7280' }}>{instructorProfile.stats?.total_courses || 0} published courses · {(instructorProfile.stats?.total_views || 0).toLocaleString()} views</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7 }}>
                      {instructorProfile.instructor.bio || 'Experienced Skolr instructor helping learners move chapter by chapter with focused lessons.'}
                    </p>
                  </div>
                )}
                {chapters.length > 0 && (
                  <div className="watch-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[['Chapters', String(chapters.length)], ['Duration', fmtDur(totalDur) || 'N/A'], ['Language', course.language?.toUpperCase() || 'EN']].map(([lbl, val]) => (
                      <div key={lbl} style={{ padding: 14, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 4 }}>{val}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af' }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'quiz' && (
              isGuestPreview ? (
                <div style={{ padding: 24, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>Quiz unlocks after signup</p>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>Create your free account to try the quiz, track your progress, and continue with the full class.</p>
                  <Link href="/register" style={{ display: 'inline-block', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>Create free account</Link>
                </div>
              ) : <ZealQuiz course={{ ...course, title: currentTitle }} />
            )}

            {tab === 'reviews' && <Reviews courseId={id} userId={user?.id} />}

            {tab === 'qa' && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a', marginBottom: 6 }}>Q&A coming soon</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Ask your instructor questions about this lesson</p>
              </div>
            )}

            {tab === 'resources' && (
              <div>
                {isGuestPreview ? (
                  <div style={{ padding: 24, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>Resources preview</p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>Students with an account can open notes, links, and practice resources attached to this class.</p>
                    <Link href="/register" style={{ display: 'inline-block', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>Sign up free</Link>
                  </div>
                ) : (
                  <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a0a', marginBottom: 4 }}>Course Resources</h3>
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>Notes, links and materials from the instructor</p>
                  </div>
                  {user?.role === 'instructor' && (
                    <button onClick={() => setShowAddRes(s => !s)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, border: 'none', borderRadius: 8, cursor: 'pointer' }}>+ Add resource</button>
                  )}
                </div>
                {showAddRes && (
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <div className="watch-resource-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Title *</label>
                        <input value={resForm.title} onChange={e => setResForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter notes" style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 7, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Type</label>
                        <select value={resForm.type} onChange={e => setResForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 7, outline: 'none', background: '#fff' }}>
                          <option value="note">Note</option>
                          <option value="link">Link</option>
                          <option value="pdf">PDF</option>
                          <option value="exercise">Exercise</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>URL (optional)</label>
                      <input value={resForm.url} onChange={e => setResForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 7, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Description</label>
                      <textarea value={resForm.description} onChange={e => setResForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." rows={2} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 7, outline: 'none', background: '#fff', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    {resError && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>{resError}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={addResource} disabled={resPending} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, border: 'none', borderRadius: 7, cursor: 'pointer' }}>{resPending ? 'Adding...' : 'Add resource'}</button>
                      <button onClick={() => { setShowAddRes(false); setResError(''); }} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
                {resLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3].map(i => <div key={i} style={{ height: 64, background: '#f3f4f6', borderRadius: 10 }} />)}</div>
                ) : resources.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12, border: '1px dashed #e5e7eb' }}>
                    <p style={{ fontSize: 14, color: '#9ca3af' }}>No resources added yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {resources.map((r: any) => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2"><path d={RES_ICONS[r.type] || RES_ICONS.note}/></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 2 }}>{r.title}</p>
                          {r.description && <p style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</p>}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#ecfdf5', color: '#059669', textTransform: 'capitalize', flexShrink: 0 }}>{r.type}</span>
                        {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: G, border: '1px solid #d1fae5', borderRadius: 6, textDecoration: 'none', flexShrink: 0 }}>Open</a>}
                      </div>
                    ))}
                  </div>
                )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {chapters.length > 0 && (
          <aside className="watch-sidebar" style={{ width: 300, flexShrink: 0, borderLeft: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
            {isGuestPreview && (
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: G, marginBottom: 6 }}>Preview unlocked</p>
                <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6, marginBottom: 10 }}>Browse the chapter outline now, then create a free account to continue the full lesson.</p>
                <Link href="/register" style={{ display: 'inline-block', padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>Sign up free</Link>
              </div>
            )}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 2 }}>Course content</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>{chapters.length} chapters{totalDur ? ' · ' + fmtDur(totalDur) : ''}</p>
            </div>
            {chapters.map((chapter, index) => {
              const isActive = activeChapter?.id === chapter.id;
              return (
                <button key={chapter.id} onClick={() => setActiveChapter(chapter)}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: isActive ? '#f0fdf4' : 'transparent', border: 'none', borderLeft: '3px solid ' + (isActive ? G : 'transparent'), borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: isActive ? G : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {isActive
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      : <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>{index + 1}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? '#0a0a0a' : '#374151', lineHeight: 1.4, marginBottom: 3 }}>{chapter.title}</p>
                    {chapter.duration_seconds > 0 && <p style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDur(chapter.duration_seconds)}</p>}
                  </div>
                </button>
              );
            })}
          </aside>
        )}
      </div>

      <footer style={{ background: '#0a0a0a', color: '#fff', padding: '28px 24px', marginTop: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: G, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Skolr</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 6 }}>Your pace, your space</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>2025 Skolr. All rights reserved.</span>
        </div>
      </footer>

      <style>{`
        .watch-mobile-content{display:none;}
        @media(max-width:900px){
          .watch-layout{display:block!important;}
          .watch-sidebar{display:none!important;}
          .watch-main{width:100%!important;}
          .watch-player-shell,.watch-meta,.watch-tabs > div,.watch-tab-panel{max-width:none!important;}
          .watch-tab-panel{padding:20px 16px 100px!important;}
          .watch-meta{padding:16px!important;}
          .watch-mobile-content{display:block!important;}
          .watch-tabs{top:60px!important;}
          .watch-overview-grid{grid-template-columns:1fr!important;}
          .watch-resource-form-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:640px){
          .watch-header{padding:0 16px!important;gap:10px!important;}
          .watch-home-link,.watch-user-chip{display:none!important;}
          .watch-tab-panel{padding:18px 14px 100px!important;}
          .watch-preview-overlay{left:14px!important;right:14px!important;bottom:14px!important;width:auto!important;max-width:none!important;}
          .watch-guest-pill{left:14px!important;right:auto!important;top:14px!important;}
        }
      `}</style>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={null}>
      <WatchContent />
    </Suspense>
  );
}
