'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import TopHeader from '@/components/layout/TopHeader';
import Link from 'next/link';
import type { EarningsSummary, Transaction } from '@/types';

const G = '#10B981';
type Period = 'month' | 'quarter' | 'year';
const PROVIDERS: Record<string, string> = { mpesa: 'M-Pesa', tigopesa: 'Tigo Pesa', airtelmoney: 'Airtel Money', card: 'Card' };
const fmt = (n: number) => n.toLocaleString('en-TZ');
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function InstructorPage() {
  const { user, logout } = useAuth();
  const [data,    setData]    = useState<EarningsSummary | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [period,  setPeriod]  = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/instructor/earnings?period=${period}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    setCoursesLoading(true);
    fetch('/api/instructor/courses', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setCourses(d.data); })
      .finally(() => setCoursesLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <TopHeader />
      <div className="page animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', color: G }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                <span className="text-xs font-semibold" style={{ color: G }}>Instructor</span>
              </div>
            </div>
          </div>
          <button className="btn-ghost text-xs !min-w-0 px-2" style={{ color: '#737373' }} onClick={logout}>Sign out</button>
        </div>

        <h1 className="text-xl font-bold mb-5" style={{ color: '#fff' }}>Earnings dashboard</h1>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="sec-head !mb-0">Your courses</h2>
            <Link href="/instructor/upload" className="text-xs font-semibold" style={{ color: G }}>New course</Link>
          </div>
          {coursesLoading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="skel h-20 rounded-2xl" />)}</div>
          ) : courses.length === 0 ? (
            <div className="card">
              <p className="text-sm" style={{ color: '#fff' }}>No courses yet.</p>
              <p className="text-xs mt-1" style={{ color: '#737373' }}>Upload your first course, then add chapters and thumbnails here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="card">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: '#1a1a1a', border: '1px solid #222' }}
                    >
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: '#525252' }}>
                          SK
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: '#fff' }}>{course.title}</p>
                      <p className="text-xs mt-1" style={{ color: '#737373' }}>
                        {course.subject} • {course.chapter_count} {course.chapter_count === 1 ? 'chapter' : 'chapters'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: course.is_published ? G : '#fbbf24' }}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </p>
                      <div className="flex gap-3 mt-3">
                        <Link href={`/instructor/courses/${course.id}/chapters`} className="text-xs font-semibold" style={{ color: G }}>
                          Manage chapters
                        </Link>
                        <Link href={`/watch/${course.id}`} className="text-xs font-semibold" style={{ color: '#60a5fa' }}>
                          Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-5">
          {(['month','quarter','year'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border !min-h-0 !min-w-0 transition-all"
              style={period === p ? { background: G, color: '#000', borderColor: G } : { background: '#1a1a1a', color: '#737373', borderColor: '#222' }}>
              {p === 'month' ? 'This Month' : p === 'quarter' ? 'Quarter' : 'This Year'}
            </button>
          ))}
        </div>

        {/* Metric cards */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3 mb-5">{[1,2,3].map(i=><div key={i} className="skel h-20 rounded-2xl"/>)}</div>
        ) : data ? (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="card">
              <p className="text-xs leading-tight mb-1" style={{ color: '#737373' }}>Revenue</p>
              <p className="text-xs font-bold" style={{ color: '#fff' }}>TZS</p>
              <p className="text-base font-bold leading-tight" style={{ color: '#fff' }}>{fmt(data.total_revenue)}</p>
            </div>
            <div className="card">
              <p className="text-xs leading-tight mb-1" style={{ color: '#737373' }}>Fee (30%)</p>
              <p className="text-xs font-bold" style={{ color: '#ef4444' }}>TZS</p>
              <p className="text-base font-bold leading-tight" style={{ color: '#ef4444' }}>{fmt(data.platform_fee)}</p>
            </div>
            <div className="card-glow">
              <p className="text-xs leading-tight mb-1" style={{ color: G }}>Net</p>
              <p className="text-xs font-bold" style={{ color: G }}>TZS</p>
              <p className="text-base font-bold leading-tight" style={{ color: G }}>{fmt(data.net_balance)}</p>
            </div>
          </div>
        ) : null}

        {/* Pending payout */}
        {data && data.pending_payout > 0 && (
          <div className="rounded-2xl p-4 flex items-center justify-between mb-5"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>Pending payout</p>
              <p className="text-xs mt-0.5" style={{ color: '#78500e' }}>Next M-Pesa transfer: 15th</p>
            </div>
            <p className="text-base font-bold" style={{ color: '#fbbf24' }}>TZS {fmt(data.pending_payout)}</p>
          </div>
        )}

        {/* Transactions */}
        <div>
          <h2 className="sec-head">Transactions</h2>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skel h-11 rounded-xl"/>)}</div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1f1f1f' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 400 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1f1f1f', background: '#1a1a1a' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold w-20" style={{ color: '#525252' }}>Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#525252' }}>Provider</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#525252' }}>Gross</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#525252' }}>Fee</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#525252' }}>Net</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold w-20" style={{ color: '#525252' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.transactions.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: '#525252', background: '#1a1a1a' }}>No transactions this period.</td></tr>
                    ) : data.transactions.map((t: Transaction) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #171717', background: '#1a1a1a' }}
                        className="hover:brightness-110 transition-all">
                        <td className="px-4 py-3 text-xs" style={{ color: '#737373' }}>{fmtDate(t.created_at)}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#e5e5e5' }}>{PROVIDERS[t.provider] || t.provider}</td>
                        <td className="px-4 py-3 text-xs text-right font-mono" style={{ color: '#fff' }}>{fmt(t.amount)}</td>
                        <td className="px-4 py-3 text-xs text-right font-mono" style={{ color: '#ef4444' }}>{fmt(t.platform_fee)}</td>
                        <td className="px-4 py-3 text-xs text-right font-mono font-bold" style={{ color: G }}>{fmt(t.net_amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge text-xs ${t.status === 'success' ? 'badge-green' : t.status === 'pending' ? 'badge-amber' : 'badge-red'}`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {data && data.transactions.length > 0 && (
                    <tfoot>
                      <tr style={{ borderTop: '1px solid #2a2a2a', background: '#222' }}>
                        <td colSpan={2} className="px-4 py-3 text-xs font-bold" style={{ color: '#fff' }}>Total</td>
                        <td className="px-4 py-3 text-xs text-right font-mono font-bold" style={{ color: '#fff' }}>{fmt(data.total_revenue)}</td>
                        <td className="px-4 py-3 text-xs text-right font-mono font-bold" style={{ color: '#ef4444' }}>{fmt(data.platform_fee)}</td>
                        <td className="px-4 py-3 text-xs text-right font-mono font-bold" style={{ color: G }}>{fmt(data.net_balance)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav role="instructor" />
    </div>
  );
}
