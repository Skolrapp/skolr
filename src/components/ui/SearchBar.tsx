'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LEVEL_COLORS } from '@/lib/constants';
const G = '#10B981';
export default function SearchBar({ placeholder = 'Search courses, subjects, instructors...', autoFocus = false, onClose }: { placeholder?: string; autoFocus?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => {
    if (query.length < 2) { setResults(null); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query), { credentials: 'include' });
        const data = await res.json();
        if (data.success) { setResults(data.data); setOpen(true); }
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);
  const goTo = (url: string) => { setOpen(false); setQuery(''); onClose?.(); router.push(url); };
  const hasResults = results && (results.courses.length > 0 || results.instructors.length > 0);
  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: loading ? G : '#525252', pointerEvents: 'none' }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onFocus={() => results && setOpen(true)} placeholder={placeholder}
          style={{ width: '100%', paddingLeft: 40, paddingRight: query ? 36 : 16, paddingTop: 10, paddingBottom: 10, fontSize: 14, background: '#1a1a1a', border: '1px solid ' + (open ? G : '#2a2a2a'), borderRadius: 12, color: '#fff', outline: 'none', transition: 'all 0.2s' }} />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#525252', padding: 2, minHeight: 0, minWidth: 0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden', maxHeight: 400, overflowY: 'auto' }}>
          {!hasResults && !loading && (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#525252' }}>No results for "{results?.query}"</p>
            </div>
          )}
          {results && results.courses.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#525252', padding: '10px 14px 6px', textTransform: 'uppercase' }}>Courses</p>
              {results.courses.map((c: any) => {
                const col = (LEVEL_COLORS as any)[c.category] || LEVEL_COLORS.primary;
                return (
                  <button key={c.id} onClick={() => goTo('/courses/' + c.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 0, minWidth: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#222')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={col.color} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                      <p style={{ fontSize: 11, color: '#737373', marginTop: 1 }}>{c.subject} · {c.instructor_name}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: col.bg, color: col.color, flexShrink: 0 }}>{c.category}</span>
                  </button>
                );
              })}
            </div>
          )}
          {results && results.instructors.length > 0 && (
            <div style={{ borderTop: results.courses.length > 0 ? '1px solid #222' : 'none' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#525252', padding: '10px 14px 6px', textTransform: 'uppercase' }}>Instructors</p>
              {results.instructors.map((inst: any) => (
                <button key={inst.id} onClick={() => goTo('/instructors/' + inst.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 0, minWidth: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#222')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {inst.avatar_url
                      ? <img src={inst.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : <span style={{ fontSize: 14, fontWeight: 700, color: G }}>{inst.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{inst.name}</p>
                    {inst.bio && <p style={{ fontSize: 11, color: '#737373', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{inst.bio}</p>}
                  </div>
                  <span style={{ fontSize: 11, color: G, flexShrink: 0 }}>View →</span>
                </button>
              ))}
            </div>
          )}
          {hasResults && (
            <button onClick={() => goTo('/courses?q=' + encodeURIComponent(query))} style={{ width: '100%', padding: '10px 14px', background: '#222', border: 'none', borderTop: '1px solid #2a2a2a', cursor: 'pointer', fontSize: 12, color: G, fontWeight: 600, textAlign: 'center', minHeight: 0, minWidth: 0 }}>
              See all results for "{query}" →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
