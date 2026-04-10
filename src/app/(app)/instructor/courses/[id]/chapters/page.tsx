'use client';
import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const G = '#10B981';

export default function ChaptersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', video_hls_url: '', duration_seconds: '' });
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', video_hls_url: '', duration_seconds: '' });

  useEffect(() => {
    fetch(`/api/courses/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setCourse(d.data.course); });
    fetch(`/api/courses/${id}/chapters`, { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setChapters(d.data); }).finally(() => setLoading(false));
  }, [id]);

  const addChapter = () => {
    setFormErr('');
    if (!form.title.trim()) { setFormErr('Title is required.'); return; }
    if (!form.video_hls_url.endsWith('.m3u8')) { setFormErr('Valid .m3u8 URL required.'); return; }
    startTransition(async () => {
      const res = await fetch(`/api/courses/${id}/chapters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ title: form.title.trim(), description: form.description || undefined, video_hls_url: form.video_hls_url, duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : 0 }) });
      const data = await res.json();
      if (data.success) { setChapters(c => [...c, data.data]); setForm({ title: '', description: '', video_hls_url: '', duration_seconds: '' }); setShowAdd(false); setSuccess('Chapter added!'); setTimeout(() => setSuccess(''), 3000); }
      else setFormErr(data.error || 'Failed.');
    });
  };

  const saveEdit = (chapterId: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/chapters/${chapterId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ title: editForm.title, description: editForm.description, video_hls_url: editForm.video_hls_url, duration_seconds: editForm.duration_seconds ? parseInt(editForm.duration_seconds) : undefined }) });
      const data = await res.json();
      if (data.success) { setChapters(c => c.map(ch => ch.id === chapterId ? data.data : ch)); setEditId(null); setSuccess('Updated!'); setTimeout(() => setSuccess(''), 3000); }
    });
  };

  const deleteChapter = (chapterId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setChapters(c => c.filter(ch => ch.id !== chapterId)); setSuccess('Deleted.'); setTimeout(() => setSuccess(''), 3000); }
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.push('/instructor')} className="!min-h-0 !min-w-0 p-1" style={{ color: '#525252' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: '#fff' }}>Manage Chapters</h1>
            {course && <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{course.title}</p>}
          </div>
        </div>

        {success && <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>{success}</div>}

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skel h-16 rounded-2xl" />)}</div> : (
          <div className="space-y-2 mb-5">
            {chapters.length === 0 && !showAdd && (
              <div className="card text-center py-8">
                <p className="text-sm mb-1" style={{ color: '#e5e5e5' }}>No chapters yet</p>
                <p className="text-xs" style={{ color: '#525252' }}>Add your first chapter below</p>
              </div>
            )}
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="card">
                {editId === chapter.id ? (
                  <div className="space-y-3">
                    <div><label className="lbl">Title</label><input className="inp" value={editForm.title} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} /></div>
                    <div><label className="lbl">Description</label><input className="inp" value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} /></div>
                    <div><label className="lbl">HLS URL</label><input className="inp font-mono text-sm" value={editForm.video_hls_url} onChange={e => setEditForm(f => ({...f, video_hls_url: e.target.value}))} /></div>
                    <div><label className="lbl">Duration (seconds)</label><input className="inp" type="number" value={editForm.duration_seconds} onChange={e => setEditForm(f => ({...f, duration_seconds: e.target.value}))} /></div>
                    <div className="flex gap-2">
                      <button className="btn-primary text-sm py-2 flex-1" onClick={() => saveEdit(chapter.id)} disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
                      <button className="btn-secondary text-sm py-2 w-auto px-4" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)', color: G }}>{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#fff' }}>{chapter.title}</p>
                      {chapter.description && <p className="text-xs mt-0.5 truncate" style={{ color: '#737373' }}>{chapter.description}</p>}
                      <p className="text-xs mt-0.5 font-mono truncate" style={{ color: '#525252' }}>{chapter.video_hls_url}</p>
                      {chapter.duration_seconds > 0 && <p className="text-xs mt-0.5" style={{ color: G }}>{Math.floor(chapter.duration_seconds / 60)} min</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditId(chapter.id); setEditForm({ title: chapter.title, description: chapter.description || '', video_hls_url: chapter.video_hls_url, duration_seconds: chapter.duration_seconds ? String(chapter.duration_seconds) : '' }); }} className="!min-h-0 !min-w-0 p-1.5 rounded-lg" style={{ background: '#222', color: '#a3a3a3' }}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteChapter(chapter.id, chapter.title)} className="!min-h-0 !min-w-0 p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showAdd ? (
          <div className="card space-y-4">
            <p className="text-sm font-bold" style={{ color: '#fff' }}>Add Chapter {chapters.length + 1}</p>
            <div><label className="lbl">Title *</label><input className="inp" placeholder="e.g. Introduction to Motion" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div><label className="lbl">Description</label><input className="inp" placeholder="What this chapter covers..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div><label className="lbl">HLS URL (.m3u8) *</label><input className="inp font-mono text-sm" placeholder="https://cdn.example.com/chapter1/index.m3u8" value={form.video_hls_url} onChange={e => setForm(f => ({...f, video_hls_url: e.target.value}))} /></div>
            <div><label className="lbl">Duration (seconds)</label><input className="inp" type="number" placeholder="e.g. 600 for 10 min" value={form.duration_seconds} onChange={e => setForm(f => ({...f, duration_seconds: e.target.value}))} /></div>
            {formErr && <p className="text-xs" style={{ color: '#f87171' }}>{formErr}</p>}
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-2.5 flex-1" onClick={addChapter} disabled={pending}>{pending ? 'Adding...' : 'Add chapter'}</button>
              <button className="btn-secondary text-sm py-2.5 w-auto px-4" onClick={() => { setShowAdd(false); setFormErr(''); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn-primary text-sm py-3" onClick={() => setShowAdd(true)}>+ Add new chapter</button>
        )}
      </div>
      <BottomNav role="instructor" />
    </div>
  );
}
