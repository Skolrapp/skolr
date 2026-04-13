'use client';
import { useState, useEffect } from 'react';
const G = '#10B981';
function Stars({ rating, interactive=false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (
        <button key={star} onClick={() => interactive && onRate?.(star)} onMouseEnter={() => interactive && setHover(star)} onMouseLeave={() => interactive && setHover(0)} className={`!min-h-0 !min-w-0 ${interactive ? 'cursor-pointer' : 'cursor-default'}`} style={{ padding: '1px' }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={(interactive ? hover||rating : rating) >= star ? '#fbbf24' : 'none'} stroke={(interactive ? hover||rating : rating) >= star ? '#fbbf24' : '#333'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
      ))}
    </div>
  );
}
export default function Reviews({ courseId, userId }: { courseId: string; userId?: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const load = () => fetch(`/api/courses/${courseId}/reviews`, { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) { setReviews(d.data.reviews); setAverage(d.data.average); setTotal(d.data.total); } });
  useEffect(() => { load().finally(() => setLoading(false)); }, [courseId]);
  const submit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    setSubmitting(true); setError('');
    const res = await fetch(`/api/courses/${courseId}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ rating, comment }) });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) { setSubmitted(true); load(); } else setError(data.error || 'Failed.');
  };
  if (loading) return <div className="space-y-2 mt-2">{[1,2].map(i => <div key={i} className="skel h-16 rounded-xl" />)}</div>;
  return (
    <div className="space-y-5 mt-2">
      {total > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#fbbf24' }}>{average}</p>
            <Stars rating={Math.round(average)} />
            <p className="text-xs mt-1" style={{ color: '#737373' }}>{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter((r: any) => r.rating === star).length;
              const pct = total > 0 ? (count/total)*100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs w-3" style={{ color: '#737373' }}>{star}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#fbbf24' }} /></div>
                  <span className="text-xs w-4" style={{ color: '#737373' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!userId ? (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p className="text-sm font-bold" style={{ color: '#fff' }}>Join Skolr to rate this course</p>
          <p className="text-sm" style={{ color: '#a3a3a3' }}>Guests can read reviews first. Create a free account to leave your own rating and keep learning.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="/register" className="btn-primary text-sm py-2.5 px-4 no-underline">Sign up free</a>
            <a href="/login" className="text-sm py-2.5 px-4 rounded-xl no-underline" style={{ color: '#fff', border: '1px solid #333' }}>Log in</a>
          </div>
        </div>
      ) : !submitted ? (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p className="text-sm font-bold" style={{ color: '#fff' }}>Rate this course</p>
          <Stars rating={rating} interactive onRate={setRating} />
          <textarea className="inp resize-none text-sm" rows={3} placeholder="Share your experience (optional)..." value={comment} onChange={e => setComment(e.target.value)} />
          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
          <button className="btn-primary text-sm py-2.5" onClick={submit} disabled={submitting}>
            {submitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Submitting...</span> : 'Submit review'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>✓ Thanks for your review!</div>
      )}
      {reviews.length === 0 ? (
        <div className="text-center py-8"><p className="text-sm" style={{ color: '#525252' }}>No reviews yet. Be the first!</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: G }}>{r.user_name.charAt(0).toUpperCase()}</div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>{r.user_name}</p>
                </div>
                <p className="text-xs" style={{ color: '#525252' }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <Stars rating={r.rating} />
              {r.comment && <p className="text-sm mt-2" style={{ color: '#a3a3a3' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
