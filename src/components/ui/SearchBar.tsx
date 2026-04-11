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
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
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
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: loading ? G : '#525252', pointerEvents: 'none' }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onFocus={() => results && setOpen(true)} placeholder={placeholder}
          style={{ width: '100%', paddingLeft: 40, paddingRight: query ? 36 : 16, paddingTop: 10, paddingBottom: 10, fontSize: 14, background: '#1a1a1a', border: `1px solid ${open ? G : '#2a2a2a'}`, borderRadius: 12, color: '#fff', outline: 'none', boxShadow: open ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none', transition: 'all 0.2s' }} />
        {query && <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#525252', padding: 2, minHeight: 0, minWidth: 0 }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden', maxHeight: 400, overflowY: 'auto' }}>
          {!hasResults && !loading && <div style={{ padding: '20px 16px', textAlign: 'center' }}><p style={{ fontSize: 13, color: '#525252' }}>No results for "{results?.query}"</p></div>}
          {results && results.courses.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#525252', padding: '10px 14px 6px', textTransform: 'uppercase' }}>Courses</p>
              {results.courses.map((c: any) => {
                const col = LEVEL_COLORS[c.category as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.primary;
                return (
                  <button key={c.id} onClick={() => goTo(`/watch/${c.id}`)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 0, minWidth: 0 }} onMouseEnter={e => (e.currentTarget.style.background='#222')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
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
                <button key={inst.id} onClick={() => goTo(`/instructors/${inst.id}`)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 0, minWidth: 0 }} onMouseEnter={e => (e.currentTarget.style.background='#222')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {inst.avatar_url ? <img src={inst.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 14, fontWeight: 700, color: G }}>{inst.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{inst.name}</p>
                    {inst.bio && <p style={{ fontSize: 11, color: '#737373', wh
cat > "src/app/(app)/instructors/[id]/page.tsx" << 'EOF'
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { LEVEL_COLORS } from '@/lib/constants';
const G = '#10B981';
function fmtDur(s: number) { if (!s) return ''; const m = Math.floor(s/60); return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`; }
function InstructorContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioEdit, setBioEdit] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch(`/api/instructors/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setData(d.data); else router.push('/courses'); }).finally(() => setLoading(false));
  }, [id, router]);
  const saveProfile = async () => {
    setSaving(true);
    await fetch(`/api/instructors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ bio: bioEdit }) });
    setSaving(false); setEditing(false); setSaved(true);
    setData((d: any) => ({ ...d, instructor: { ...d.instructor, bio: bioEdit } }));
    setTimeout(() => setSaved(false), 3000);
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#111111' }}><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2a2a2a', borderTopColor: G }} /></div>;
  if (!data) return null;
  const { instructor, courses, stats } = data;
  const isOwn = user?.id === instructor.id;
  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page pb-32">
        <button onClick={() => router.back()} className="!min-h-0 !min-w-0 p
cat > "src/app/(app)/instructors/[id]/page.tsx" << 'EOF'
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { LEVEL_COLORS } from '@/lib/constants';
const G = '#10B981';
function fmtDur(s: number) { if (!s) return ''; const m = Math.floor(s/60); return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`; }
function InstructorContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioEdit, setBioEdit] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch(`/api/instructors/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setData(d.data); else router.push('/courses'); }).finally(() => setLoading(false));
  }, [id, router]);
  const saveProfile = async () => {
    setSaving(true);
    await fetch(`/api/instructors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ bio: bioEdit }) });
    setSaving(false); setEditing(false); setSaved(true);
    setData((d: any) => ({ ...d, instructor: { ...d.instructor, bio: bioEdit } }));
    setTimeout(() => setSaved(false), 3000);
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#111111' }}><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2a2a2a', borderTopColor: G }} /></div>;
  if (!data) return null;
  const { instructor, courses, stats } = data;
  const isOwn = user?.id === instructor.id;
  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page pb-32">
        <button onClick={() => router.back()} className="!min-h-0 !min-w-0 p-1 flex items-center gap-2 mb-5" style={{ color: '#525252' }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          <span className="text-sm">Back</span>
        </button>
        <div className="card mb-5">
          <div className="flex items-start gap-4">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(16,185,129,0.25)' }}>
              {instructor.avatar_url ? <img src={instructor.avatar_url} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 800, color: G }}>{instructor.name.charAt(0).toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold" style={{ color: '#fff' }}>{instructor.name}</h1>
              <div className="flex items-center gap-1.5 mt-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} /><span className="text-xs font-semibold" style={{ color: G }}>Instructor</span></div>
              <div className="flex gap-4 mt-3">
                <div><p className="text-lg font-bold" style={{ color: '#fff' }}>{stats.total_courses}</p><p className="text-xs" style={{ color: '#737373' }}>Courses</p></div>
                <div><p className="text-lg font-bold" style={{ color: '#fff' }}>{stats.total_views.toLocaleString()}</p><p className="text-xs" style={{ color: '#737373' }}>Views</p></div>
              </div>
            </div>
          </div>
          <div className="mt-4" style={{ borderTop: '1px solid #222', paddingTop: 14 }}>
            {editing ? (
              <div className="space-y-3">
                <textarea className="inp resize-none text-sm" rows={4} placeholder="Write a short bio..." value={bioEdit} onChange={e => setBioEdit(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn-primary text-sm py-2 flex-1" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save bio'}</button>
                  <button className="btn-secondary text-sm py-2 w-auto px-4" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {instructor.bio ? <p className="text-sm leading-relaxed" style={{ color: '#a3a3a3' }}>{instructor.bio}</p> : <p className="text-sm" style={{ color: '#525252' }}>{isOwn ? 'Add a bio to help students learn about you.' : 'No bio yet.'}</p>}
                {isOwn && <button onClick={() => { setBioEdit(instructor.bio || ''); setEditing(true); }} className="text-xs font-semibold mt-2 !min-h-0 !min-w-0 px-0" style={{ color: G }}>{instructor.bio ? 'Edit bio' : '+ Add bio'}</button>}
                {saved && <p className="text-xs mt-1" style={{ color: G }}>Bio saved!</p>}
              </>
            )}
          </div>
        </div>
        <div>
          <h2 className="sec-head">Courses by {instructor.name.split(' ')[0]}</h2>
          {courses.length === 0 ? <div className="card text-center py-8"><p className="text-sm" style={{ color: '#525252' }}>No courses published yet.</p></div> : (
            <div className="space-y-3">
              {courses.map((c: any) => {
                const col = LEVEL_COLORS[c.category as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.primary;
                return (
                  <Link key={c.id} href={`/watch/${c.id}`} className="card flex gap-3 items-start no-underline active:scale-[0.98] transition-transform block">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: col.bg }}>
                      <svg className="w-6 h-6" style={{ color: col.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug" style={{ color: '#fff' }}>{c.title}</p>
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
          )}
        </div>
      </div>
      <BottomNav role={user?.role} />
    </div>
  );
}
export default function InstructorPage() {
  return <Suspense fallback={<div style={{ background: '#111111', minHeight: '100vh' }} />}><InstructorContent /></Suspense>;
}
