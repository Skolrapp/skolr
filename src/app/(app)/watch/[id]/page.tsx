'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/player/VideoPlayer';
import BottomNav from '@/components/layout/BottomNav';
import AIQuiz from '@/components/ai/AIQuiz';
import Reviews from '@/components/ui/Reviews';
import { useAuth } from '@/hooks/useAuth';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import { LEVEL_COLORS } from '@/lib/constants';
import { saveProgressAction } from '@/actions/courses';
import type { Course, Chapter } from '@/types';

const G = '#10B981';
type Tab = 'overview' | 'quiz' | 'qa' | 'notes';

function fmtDur(s: number) {
  if (!s) return '';
  const m = Math.floor(s / 60);
  return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

function WatchContent() {
  const params = useParams(); const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState('overview');
  const [notes, setNotes] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetch('/api/courses/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(async d => {
        if (d.success) {
          setCourse(d.data.course);
          setProgress(d.data.progress_seconds || 0);
          const cr = await fetch('/api/courses/' + id + '/chapters', { credentials: 'include' });
          const cd = await cr.json();
          if (cd.success && cd.data.length > 0) {
            setChapters(cd.data);
            setActiveChapter(cd.data[0]);
          }
        } else {
          router.push('/courses');
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!user || !course) return;
    const active = isSubscriptionActive(user.subscription_expires_at);
    const access = active && canAccessLevel(user.subscription_tier, course.category);
    setLocked(!access);
  }, [user, course]);

  const handleProgress = useCallback(async (seconds) => {
    setProgress(seconds);
    await saveProgressAction(id, seconds);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2a2a2a', borderTopColor: G }} />
    </div>
  );

  if (!course) return null;

  if (locked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#111111' }}>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Subscription required</h2>
      <p className="text-sm mb-6" style={{ color: '#737373' }}>This course requires a plan that includes {course.category} content.</p>
      <button className="btn-primary w-auto px-8 mb-3" onClick={() => router.push('/settings')}>View plans</button>
      <button className="btn-ghost text-sm" onClick={() => router.back()}>Go back</button>
    </div>
  );

  const col = LEVEL_COLORS[course.category];
  const currentVideo = activeChapter ? activeChapter.video_hls_url : course.video_hls_url;
  const currentTitle = activeChapter ? activeChapter.title : course.title;
  const totalDuration = chapters.reduce((s, c) => s + c.duration_seconds, 0);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: '#111111', borderBottom: '1px solid #1f1f1f' }}>
        <button onClick={() => router.back()} className="!min-h-0 !min-w-0 p-1 flex items-center gap-2" style={{ color: '#a3a3a3' }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          <span className="text-sm font-medium" style={{ color: '#fff' }}>{course.title}</span>
        </button>
        <button onClick={() => setShowSidebar(s => !s)} className="!min-h-0 !min-w-0 p-2 rounded-lg" style={{ background: showSidebar ? 'rgba(16,185,129,0.15)' : '#1a1a1a', color: showSidebar ? G : '#737373' }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="flex-1">
          <div style={{ background: '#000' }}>
            <VideoPlayer hlsUrl={currentVideo} posterUrl={course.thumbnail_url} title={currentTitle} startAt={activeChapter ? 0 : progress} onProgress={handleProgress} />
          </div>

          <div className="px-4 py-4" style={{ borderBottom: '1px solid #1f1f1f' }}>
            <h1 className="text-lg font-bold" style={{ color: '#fff' }}>{currentTitle}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge text-xs" style={{ background: col.bg, color: col.color }}>{course.category}</span>
              {course.sub_category && <span className="badge text-xs" style={{ background: col.bg, color: col.color }}>{course.sub_category}</span>}
              <span className="badge badge-gray text-xs">{course.subject}</span>
            </div>
          </div>

          <div className="flex" style={{ borderBottom: '1px solid #1f1f1f' }}>
            {['overview', 'quiz', 'reviews', 'qa', 'notes'].map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-3 text-sm font-medium capitalize !min-h-0 !min-w-0 !rounded-none transition-colors"
                style={tab === t ? { color: G, borderBottom: '2px solid ' + G } : { color: '#737373', borderBottom: '2px solid transparent' }}>
                {t === 'qa' ? 'Q&A' : t === 'quiz' ? 'AI Quiz' : t}
              </button>
            ))}
          </div>

          <div className="px-4 py-5 pb-28">
            {tab === 'overview' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: '#a3a3a3' }}>{course.description || 'No description available.'}</p>
                <div className="flex items-center gap-3 py-3" style={{ borderTop: '1px solid #1f1f1f' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(16,185,129,0.12)', color: G }}>{(course.instructor_name || 'I').charAt(0)}</div>
                  <div>
                    <p className="text-xs" style={{ color: '#737373' }}>Instructor</p>
                    <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{course.instructor_name}</p>
                  </div>
                </div>
                {chapters.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <p className="text-lg font-bold" style={{ color: G }}>{chapters.length}</p>
                      <p className="text-xs" style={{ color: '#737373' }}>Chapters</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <p className="text-lg font-bold" style={{ color: '#fff' }}>{fmtDur(totalDuration)}</p>
                      <p className="text-xs" style={{ color: '#737373' }}>Total time</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'quiz' && <AIQuiz course={{ ...course, title: currentTitle }} />}

            {tab === 'reviews' && <Reviews courseId={id} userId={user?.id} />}

            {tab === 'qa' && (
              <div className="text-center py-12">
                <p className="text-sm font-semibold mb-1" style={{ color: '#e5e5e5' }}>Q&A coming soon</p>
                <p className="text-xs" style={{ color: '#525252' }}>Ask your instructor questions about this lesson</p>
              </div>
            )}

            {tab === 'notes' && (
              <div className="space-y-3">
                <p className="text-xs" style={{ color: '#737373' }}>Your personal notes</p>
                <textarea className="inp resize-none text-sm" rows={8} placeholder="Write your notes here..." value={notes} onChange={e => setNotes(e.target.value)} />
                <button className="btn-primary text-sm py-2.5">Save notes</button>
              </div>
            )}
          </div>
        </div>

        {showSidebar && chapters.length > 0 && (
          <div className="lg:w-80 lg:flex-shrink-0" style={{ background: '#111111', borderLeft: '1px solid #1f1f1f' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #1f1f1f' }}>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Course content</p>
              <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{chapters.length} chapters · {fmtDur(totalDuration)}</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              {chapters.map((chapter, index) => {
                const isActive = activeChapter && activeChapter.id === chapter.id;
                return (
                  <button key={chapter.id} onClick={() => setActiveChapter(chapter)} className="w-full flex items-start gap-3 px-4 py-3 text-left !min-h-0 !min-w-0 !rounded-none transition-colors"
                    style={{ background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent', borderLeft: isActive ? '3px solid ' + G : '3px solid transparent', borderBottom: '1px solid #1a1a1a' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{ background: isActive ? G : '#222', color: isActive ? '#000' : '#737373' }}>
                      {isActive ? <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug" style={{ color: isActive ? '#fff' : '#a3a3a3' }}>{chapter.title}</p>
                      {chapter.duration_seconds > 0 && <p className="text-xs mt-0.5" style={{ color: '#525252' }}>{fmtDur(chapter.duration_seconds)}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <BottomNav role={user ? user.role : 'student'} />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }} />}>
      <WatchContent />
    </Suspense>
  );
}
