'use client';
export const dynamic = 'force-dynamic';
import { useState, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { EDUCATION_LEVELS, LEVEL_COLORS, SUBJECTS } from '@/lib/constants';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import type { Course, EducationLevel } from '@/types';

const G = '#10B981';
function fmtDur(s: number) { if (!s) return ''; const m = Math.floor(s/60); return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`; }

function CoursesContent() {
  const { user }  = useAuth();
  const sp        = useSearchParams();
  const [level,   setLevel]   = useState<EducationLevel|''>((sp.get('level') as EducationLevel) || '');
  const [sub,     setSub]     = useState('');
  const [subject, setSubject] = useState('');
  const [search,  setSearch]  = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showF,   setShowF]   = useState(false);

  const selLevel = EDUCATION_LEVELS.find(l => l.key === level);
  const selCol   = level ? LEVEL_COLORS[level] : null;
  const subActive = isSubscriptionActive(user?.subscription_expires_at);

  const fetch_ = useCallback(async (reset = false) => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(reset ? 1 : page), per_page: '15' });
    if (level)   p.set('level',   level);
    if (sub)     p.set('sub',     sub);
    if (subject) p.set('subject', subject);
    if (search)  p.set('q',       search);
    const res  = await fetch(`/api/courses?${p}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setCourses(prev => reset ? data.data.items : [...prev, ...data.data.items]);
      setTotal(data.data.total);
      setHasMore(data.data.has_more);
      if (reset) setPage(1);
    }
    setLoading(false);
  }, [level, sub, subject, search, page]);

  useEffect(() => { fetch_(true); }, [level, sub, subject]); // eslint-disable-line
  useEffect(() => { const t = setTimeout(() => fetch_(true), 350); return () => clearTimeout(t); }, [search]); // eslint-disable-line

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      {/* Sticky search/filter header */}
      <div className="sticky top-0 z-30" style={{ background: '#111111', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#525252' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="inp pl-9 pr-10 py-2.5 text-sm" placeholder="Search Skolr courses..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 !min-h-0 !min-w-0 p-1" onClick={() => setShowF(f => !f)}>
              <svg className="w-5 h-5" style={{ color: showF ? G : '#525252' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Level pills */}
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <button onClick={() => { setLevel(''); setSub(''); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold !min-h-0 !min-w-0"
              style={level === '' ? { background: G, color: '#000', border: 'none' } : { background: '#1a1a1a', color: '#525252', border: '1px solid #2a2a2a' }}>
              All
            </button>
            {EDUCATION_LEVELS.map(l => (
              <button key={l.key} onClick={() => { setLevel(l.key); setSub(''); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold !min-h-0 !min-w-0"
                style={level === l.key
                  ? { background: LEVEL_COLORS[l.key].color, color: '#000', border: 'none' }
                  : { background: '#1a1a1a', color: '#525252', border: '1px solid #2a2a2a' }}>
                {l.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sub-category pills */}
          {selLevel && selLevel.sub_categories.length > 0 && selCol && (
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              <button onClick={() => setSub('')}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold !min-h-0 !min-w-0"
                style={sub === '' ? { background: selCol.color, color: '#000', border: 'none' } : { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#737373' }}>
                All
              </button>
              {selLevel.sub_categories.map(s => (
                <button key={s} onClick={() => setSub(s)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold !min-h-0 !min-w-0"
                  style={sub === s ? { background: selCol.color, color: '#000', border: 'none' } : { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#737373' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {showF && (
            <div className="pt-1 space-y-2" style={{ borderTop: '1px solid #1a1a1a' }}>
              <select className="sel text-sm py-2" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">All subjects</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              {(level || sub || subject || search) && (
                <button className="text-xs font-semibold !min-h-0 !min-w-0 px-0" style={{ color: '#ef4444' }}
                  onClick={() => { setLevel(''); setSub(''); setSubject(''); setSearch(''); }}>
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="page pt-4">
        <p className="text-xs mb-3" style={{ color: '#525252' }}>{loading ? 'Loading...' : `${total.toLocaleString()} course${total !== 1 ? 's' : ''}`}</p>

        {loading && courses.length === 0 ? (
          <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="card flex gap-3"><div className="skel w-16 h-16 rounded-xl flex-shrink-0"/><div className="flex-1 space-y-2 py-1"><div className="skel h-3 w-4/5 rounded"/><div className="skel h-2.5 w-1/2 rounded"/></div></div>)}</div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm font-semibold mb-1" style={{ color: '#e5e5e5' }}>No courses found</p>
            <p className="text-xs" style={{ color: '#525252' }}>Try different filters</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {courses.map(c => {
                const col       = LEVEL_COLORS[c.category];
                const hasAccess = subActive && user && canAccessLevel(user.subscription_tier, c.category);
                return (
                  <Link key={c.id} href={hasAccess ? `/watch/${c.id}` : '/settings'}
                    className="card flex gap-3 items-start no-underline active:scale-[0.98] transition-transform relative overflow-hidden">
                    {!hasAccess && (
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-end pr-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                          <svg className="w-3 h-3" style={{ color: '#fbbf24' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>
                          <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Upgrade</span>
                        </div>
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: col.bg }}>
                      {c.thumbnail_url
                        ? <img src={c.thumbnail_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        : <svg className="w-7 h-7" style={{ color: col.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug line-clamp-2" style={{ color: '#fff' }}>{c.title}</p>
                      <p className="text-xs mt-1 truncate" style={{ color: '#737373' }}>{c.instructor_name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="badge text-xs" style={{ background: col.bg, color: col.color }}>{c.sub_category || c.category}</span>
                        <span className="badge badge-gray text-xs">{c.subject}</span>
                        {c.duration_seconds > 0 && <span className="badge badge-gray text-xs">{fmtDur(c.duration_seconds)}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <div className="text-center mt-6">
                <button className="btn-secondary text-sm py-2.5 w-auto px-8"
                  onClick={() => { setPage(p => p+1); fetch_(false); }} disabled={loading}>
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav role={user?.role} />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesContent />
    </Suspense>
  );
}
