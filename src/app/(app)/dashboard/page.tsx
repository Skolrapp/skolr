'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { EDUCATION_LEVELS, LEVEL_COLORS } from '@/lib/constants';
import { canAccessLevel, isSubscriptionActive, SUBSCRIPTION_BUNDLES } from '@/lib/subscriptions';
import type { Course, EducationLevel } from '@/types';

const G = '#10B981';

function fmtDur(s: number) { if (!s) return ''; const m = Math.floor(s/60); return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`; }

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const [courses, setCourses]     = useState<Course[]>([]);
  const [counts,  setCounts]      = useState<Partial<Record<EducationLevel, number>>>({});
  const [fetching,setFetching]    = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/courses?per_page=6', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) { setCourses(d.data.items); setCounts(d.data.category_counts || {}); } })
      .finally(() => setFetching(false));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#111111' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2a2a2a', borderTopColor: G }} />
    </div>
  );
  if (!user) return null;

  const subActive = isSubscriptionActive(user.subscription_expires_at);
  const bundle    = SUBSCRIPTION_BUNDLES.find(b => b.id === user.subscription_tier);

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', color: G }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs" style={{ color: '#737373' }}>Welcome back</p>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>{user.name.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {subActive && bundle ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                <span className="text-xs font-semibold" style={{ color: G }}>{bundle.name}</span>
              </div>
            ) : (
              <Link href="/settings" className="badge badge-amber text-xs !min-h-0 !min-w-0">Free</Link>
            )}
            <button className="btn-ghost text-xs !min-w-0 px-2" onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card">
            <p className="text-xs mb-1" style={{ color: '#737373' }}>Courses available</p>
            <p className="text-2xl font-bold" style={{ color: G }}>{Object.values(counts).reduce((a,b)=>a+(b||0),0) || '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs mb-1" style={{ color: '#737373' }}>My access</p>
            <p className="text-sm font-bold" style={{ color: '#fff' }}>{bundle?.name || 'Free plan'}</p>
            <p className="text-xs mt-0.5" style={{ color: subActive ? G : '#ef4444' }}>
              {subActive ? 'Active' : user.subscription_tier === 'free' ? 'Upgrade to unlock' : 'Expired'}
            </p>
          </div>
        </div>

        {/* Level cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="sec-head mb-0">Browse by level</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {EDUCATION_LEVELS.map(level => {
              const col     = LEVEL_COLORS[level.key];
              const hasAccess = subActive && canAccessLevel(user.subscription_tier, level.key);
              const count   = counts[level.key] || 0;
              return (
                <Link key={level.key} href={hasAccess ? `/courses?level=${level.key}` : '/settings'}
                  className={`card flex flex-col gap-2 transition-transform active:scale-95 no-underline relative overflow-hidden ${!hasAccess ? 'opacity-60' : ''}`}>
                  {!hasAccess && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-3.5 h-3.5" style={{ color: '#525252' }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                      </svg>
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: col.bg, color: col.color }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#fff' }}>{level.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{level.description}</p>
                    {count > 0 && <p className="text-xs font-semibold mt-1" style={{ color: col.color }}>{count} courses</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent courses */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="sec-head mb-0">Recently added</h2>
            <Link href="/courses" className="text-xs font-semibold !min-h-0 !min-w-0 inline-flex" style={{ color: G }}>See all</Link>
          </div>
          {fetching ? (
            <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="card flex gap-3"><div className="skel w-12 h-12 rounded-xl flex-shrink-0"/><div className="flex-1 space-y-2 py-1"><div className="skel h-3 w-3/4 rounded"/><div className="skel h-2.5 w-1/2 rounded"/></div></div>)}</div>
          ) : courses.length === 0 ? (
            <div className="card text-center py-6"><p className="text-sm" style={{ color: '#525252' }}>No courses yet.</p></div>
          ) : (
            <div className="space-y-2">
              {courses.map(c => {
                const col = LEVEL_COLORS[c.category];
                return (
                  <Link key={c.id} href={`/watch/${c.id}`}
                    className="card flex gap-3 items-center no-underline active:scale-[0.98] transition-transform">
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: col.bg }}>
                      {c.thumbnail_url
                        ? <img src={c.thumbnail_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        : <svg className="w-5 h-5" style={{ color: col.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#fff' }}>{c.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{c.subject} {c.sub_category ? `· ${c.sub_category}` : ''} {c.duration_seconds > 0 ? `· ${fmtDur(c.duration_seconds)}` : ''}</p>
                    </div>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#2a2a2a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upgrade CTA if on free */}
        {user.subscription_tier === 'free' && (
          <div className="card-glow animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: G }} viewBox="0 0 24 24" fill="currentColor"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </div>
              <p className="text-sm font-bold" style={{ color: G }}>Unlock HD Learning</p>
            </div>
            <p className="text-xs mb-4" style={{ color: '#a3a3a3' }}>
              Choose a plan that matches your level. Pay with M-Pesa, Tigo Pesa, or Airtel Money.
            </p>
            <Link href="/settings" className="btn-primary text-sm py-2.5">View subscription plans</Link>
          </div>
        )}
      </div>
      <BottomNav role={user.role} />
    </div>
  );
}
