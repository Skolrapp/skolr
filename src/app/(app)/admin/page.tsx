'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import TopHeader from '@/components/layout/TopHeader';

const G = '#10B981';

export default function AdminPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetch('/api/admin/course-reviews', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const reviewCourse = (id: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/course-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          admin_notes: noteDrafts[id] || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: data.data.status, admin_notes: data.data.admin_notes, reviewed_at: data.data.reviewed_at }
              : item
          )
        );
        setActiveId(null);
        setMessage(action === 'approve' ? 'Course approved and now live.' : 'Course sent back to the instructor.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Review action failed.');
        setTimeout(() => setMessage(''), 4000);
      }
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <TopHeader />
      <div className="page animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#fff' }}>Course review queue</h1>
            <p className="text-xs mt-1" style={{ color: '#737373' }}>Approve or reject instructor submissions before they go live.</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: G }}>
            Admin
          </div>
        </div>

        {message && (
          <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skel h-28 rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="card">
            <p className="text-sm font-semibold" style={{ color: '#fff' }}>No submissions waiting.</p>
            <p className="text-xs mt-1" style={{ color: '#737373' }}>Instructors will appear here after they submit a course for review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const course = item.courses;
              const instructor = item.users;
              const isPending = item.status === 'pending';

              return (
                <div key={item.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                      {course?.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: '#525252' }}>SK</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold" style={{ color: '#fff' }}>{course?.title || 'Untitled course'}</p>
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: isPending ? 'rgba(251,191,36,0.12)' : item.status === 'approved' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: isPending ? '#fbbf24' : item.status === 'approved' ? G : '#f87171' }}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#737373' }}>
                        {course?.subject} • {course?.category}{course?.sub_category ? ` • ${course.sub_category}` : ''}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>
                        Instructor: {instructor?.name || 'Unknown'}{instructor?.phone ? ` • ${instructor.phone}` : ''}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#525252' }}>
                        Submitted: {new Date(item.submitted_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      className="text-xs font-semibold"
                      style={{ color: G }}
                      onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                    >
                      {activeId === item.id ? 'Hide review notes' : 'Open review notes'}
                    </button>
                  </div>

                  {activeId === item.id && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        className="inp resize-none"
                        rows={4}
                        placeholder="Leave feedback for the instructor..."
                        value={noteDrafts[item.id] ?? item.admin_notes ?? ''}
                        onChange={(e) => setNoteDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                      />
                      {isPending && (
                        <div className="flex gap-2">
                          <button className="btn-primary text-sm py-2.5 flex-1" disabled={pending} onClick={() => reviewCourse(item.id, 'approve')}>
                            {pending ? 'Working...' : 'Approve and publish'}
                          </button>
                          <button className="btn-secondary text-sm py-2.5 flex-1" disabled={pending} onClick={() => reviewCourse(item.id, 'reject')}>
                            Request changes
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav role="admin" />
    </div>
  );
}
