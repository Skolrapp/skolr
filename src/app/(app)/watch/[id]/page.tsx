'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/player/VideoPlayer';
import BottomNav from '@/components/layout/BottomNav';
import AIQuiz from '@/components/ai/AIQuiz';
import { useAuth } from '@/hooks/useAuth';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import { LEVEL_COLORS } from '@/lib/constants';
import { saveProgressAction } from '@/actions/courses';
import type { Course } from '@/types';

const G = '#10B981';

export default function WatchPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user } = useAuth();

  const [course,   setCourse]   = useState<Course | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [locked,   setLocked]   = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setCourse(d.data.course);
          setProgress(d.data.progress_seconds || 0);
        } else {
          router.push('/courses');
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  // Check access once we have both user and course
  useEffect(() => {
    if (!user || !course) return;
    const active = isSubscriptionActive(user.subscription_expires_at);
    const access = active && canAccessLevel(user.subscription_tier, course.category);
    setLocked(!access);
  }, [user, course]);

  const handleProgress = useCallback(async (seconds: number) => {
    setProgress(seconds);
    await saveProgressAction(id, seconds);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2a2a2a', borderTopColor: G }} />
    </div>
  );

  if (!course) return null;

  // Access gated view
  if (locked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#111111' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
        <svg className="w-8 h-8" style={{ color: '#fbbf24' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Subscription required</h2>
      <p className="text-sm mb-2" style={{ color: '#a3a3a3' }}>
        <span className="font-semibold" style={{ color: '#fbbf24' }}>{course.title}</span>
      </p>
      <p className="text-sm mb-6" style={{ color: '#737373' }}>
        This course requires a plan that includes <strong style={{ color: '#fff' }}>{course.category}</strong> content.
      </p>
      <button className="btn-primary w-auto px-8 mb-3" onClick={() => router.push('/settings')}>
        View subscription plans
      </button>
      <button className="btn-ghost text-sm" onClick={() => router.back()}>Go back</button>
    </div>
  );

  const col       = LEVEL_COLORS[course.category];
  const durMins   = Math.round(course.duration_seconds / 60);
  const pct       = course.duration_seconds > 0 ? Math.min(100, Math.round((progress / course.duration_seconds) * 100)) : 0;

  return (
    <div className="min-h-screen pb-20" style={{ background: '#000000' }}>
      {/* Back bar */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <button onClick={() => router.back()} className="!min-h-0 !min-w-0 p-1" style={{ color: '#a3a3a3' }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m7-7l-7 7 7 7"/>
          </svg>
        </button>
        <p className="text-sm font-medium truncate flex-1" style={{ color: '#fff' }}>{course.title}</p>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="text-xs font-bold" style={{ color: G }}>HD</span>
        </div>
      </div>

      {/* Video — full bleed */}
      <div className="sm:px-4">
        <VideoPlayer
          hlsUrl={course.video_hls_url}
          posterUrl={course.thumbnail_url}
          title={course.title}
          startAt={progress}
          onProgress={handleProgress}
        />
      </div>

      {/* Info panel */}
      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="badge text-xs" style={{ background: col.bg, color: col.color }}>{course.category}</span>
          {course.sub_category && <span className="badge text-xs" style={{ background: col.bg, color: col.color }}>{course.sub_category}</span>}
          <span className="badge badge-gray text-xs">{course.subject}</span>
          {durMins > 0 && <span className="badge badge-gray text-xs">{durMins} min</span>}
        </div>

        <h1 className="text-lg font-bold leading-snug" style={{ color: '#fff' }}>{course.title}</h1>
        {course.description && <p className="text-sm leading-relaxed" style={{ color: '#a3a3a3' }}>{course.description}</p>}

        {/* Instructor */}
        <div className="flex items-center gap-3 py-3" style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.12)', color: G }}>
            {(course.instructor_name || 'I').charAt(0)}
          </div>
          <div>
            <p className="text-xs" style={{ color: '#737373' }}>Instructor</p>
            <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{course.instructor_name}</p>
          </div>
        </div>

        {/* Progress */}
        {pct > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#737373' }}>
              <span>Your progress</span>
              <span style={{ color: G }}>{pct}%</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* AI Quiz */}
        <AIQuiz course={course} />
      </div>

      <BottomNav role={user?.role} />
    </div>
  );
}
