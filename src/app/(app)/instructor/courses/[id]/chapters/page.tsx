'use client';

import { ChangeEvent, useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { uploadVideoToBunny } from '@/lib/bunny/client';

const G = '#10B981';

type ChapterForm = {
  title: string;
  description: string;
  video_hls_url: string;
  duration_seconds: string;
  release_at: string;
};

const EMPTY_FORM: ChapterForm = {
  title: '',
  description: '',
  video_hls_url: '',
  duration_seconds: '',
  release_at: '',
};

type UploadedVideo = {
  hlsUrl: string;
  durationSeconds: number;
  fileName: string;
};

export default function ChaptersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ChapterForm>(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ChapterForm>(EMPTY_FORM);
  const [addUploadProgress, setAddUploadProgress] = useState('');
  const [addVideoError, setAddVideoError] = useState('');
  const [addUploadedVideo, setAddUploadedVideo] = useState<UploadedVideo | null>(null);
  const [uploadingAddVideo, setUploadingAddVideo] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState('');
  const [editVideoError, setEditVideoError] = useState('');
  const [editUploadedVideo, setEditUploadedVideo] = useState<UploadedVideo | null>(null);
  const [uploadingEditVideo, setUploadingEditVideo] = useState(false);
  const canManageVideos = user?.role === 'admin' || (!!course && !course.is_published);

  useEffect(() => {
    fetch(`/api/courses/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCourse(d.data.course);
      });
    fetch(`/api/courses/${id}/chapters`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setChapters(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addChapter = () => {
    setFormErr('');
    if (!form.title.trim()) {
      setFormErr('Title is required.');
      return;
    }
    if (!form.video_hls_url.endsWith('.m3u8')) {
      setFormErr('Upload a chapter video first.');
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/courses/${id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description || undefined,
          video_hls_url: form.video_hls_url,
          duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : 0,
          release_at: form.release_at || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChapters((c) => [...c, data.data]);
        setForm(EMPTY_FORM);
        setShowAdd(false);
        setAddUploadProgress('');
        setAddVideoError('');
        setAddUploadedVideo(null);
        setSuccess('Chapter added!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setFormErr(data.error || 'Failed.');
      }
    });
  };

  const saveEdit = (chapterId: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          video_hls_url: editForm.video_hls_url,
          duration_seconds: editForm.duration_seconds ? parseInt(editForm.duration_seconds) : 0,
          release_at: editForm.release_at || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChapters((c) => c.map((ch) => (ch.id === chapterId ? data.data : ch)));
        setEditId(null);
        setEditUploadProgress('');
        setEditVideoError('');
        setEditUploadedVideo(null);
        setSuccess('Updated!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setEditVideoError(data.error || 'Failed to update chapter.');
      }
    });
  };

  const deleteChapter = (chapterId: string, title: string) => {
    if (!canManageVideos) {
      setSuccess('');
      setFormErr('Published course videos can only be changed or removed by an admin.');
      return;
    }
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setChapters((c) => c.filter((ch) => ch.id !== chapterId));
        setSuccess('Deleted.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setFormErr(data.error || 'Delete failed.');
      }
    });
  };

  const uploadAddVideo = async (file: File) => {
    setUploadingAddVideo(true);
    setAddVideoError('');
    try {
      const uploaded = await uploadVideoToBunny(file, setAddUploadProgress);
      setAddUploadedVideo({
        hlsUrl: uploaded.hlsUrl,
        durationSeconds: uploaded.durationSeconds,
        fileName: uploaded.fileName,
      });
      setForm((current) => ({
        ...current,
        video_hls_url: uploaded.hlsUrl,
        duration_seconds: uploaded.durationSeconds ? String(uploaded.durationSeconds) : current.duration_seconds,
      }));
      setAddUploadProgress('Upload complete. Bunny is processing this chapter.');
    } catch (error) {
      setAddVideoError(error instanceof Error ? error.message : 'Upload failed.');
      setAddUploadProgress('');
    } finally {
      setUploadingAddVideo(false);
    }
  };

  const uploadEditVideo = async (file: File) => {
    setUploadingEditVideo(true);
    setEditVideoError('');
    try {
      const uploaded = await uploadVideoToBunny(file, setEditUploadProgress);
      setEditUploadedVideo({
        hlsUrl: uploaded.hlsUrl,
        durationSeconds: uploaded.durationSeconds,
        fileName: uploaded.fileName,
      });
      setEditForm((current) => ({
        ...current,
        video_hls_url: uploaded.hlsUrl,
        duration_seconds: uploaded.durationSeconds ? String(uploaded.durationSeconds) : current.duration_seconds,
      }));
      setEditUploadProgress('Upload complete. Bunny is processing this chapter.');
    } catch (error) {
      setEditVideoError(error instanceof Error ? error.message : 'Upload failed.');
      setEditUploadProgress('');
    } finally {
      setUploadingEditVideo(false);
    }
  };

  const handleAddVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setAddVideoError('Please choose a video file.');
      return;
    }
    await uploadAddVideo(file);
  };

  const handleEditVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setEditVideoError('Please choose a video file.');
      return;
    }
    await uploadEditVideo(file);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.push('/instructor')} className="!min-h-0 !min-w-0 p-1" style={{ color: '#525252' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: '#fff' }}>Manage Chapters</h1>
            {course && <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{course.title}</p>}
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>Build the course like Udemy</p>
          <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>
            Add as many chapter videos as you need. Each chapter uploads straight to Bunny and plays in sequence inside the course.
          </p>
          {!canManageVideos && (
            <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>
              This course is published. Video edits and deletions are locked until an admin steps in.
            </p>
          )}
        </div>

        {formErr && <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{formErr}</div>}
        {success && <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>{success}</div>}

        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skel h-16 rounded-2xl" />)}</div>
        ) : (
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
                    <div><label className="lbl">Title</label><input className="inp" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} /></div>
                    <div><label className="lbl">Description</label><input className="inp" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} /></div>
                    <div>
                      <label className="lbl">Replace chapter video</label>
                      <input className="inp" type="file" accept="video/*" onChange={handleEditVideoChange} disabled={uploadingEditVideo || pending || !canManageVideos} />
                      {editUploadProgress && <p className="text-xs mt-2" style={{ color: editUploadedVideo ? G : '#d4d4d8' }}>{editUploadProgress}</p>}
                      {editUploadedVideo && <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>{editUploadedVideo.fileName}</p>}
                      {editVideoError && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{editVideoError}</p>}
                    </div>
                    <div><label className="lbl">HLS URL</label><input className="inp font-mono text-sm" value={editForm.video_hls_url} onChange={(e) => setEditForm((f) => ({ ...f, video_hls_url: e.target.value }))} /></div>
                    <div><label className="lbl">Duration (seconds)</label><input className="inp" type="number" value={editForm.duration_seconds} onChange={(e) => setEditForm((f) => ({ ...f, duration_seconds: e.target.value }))} /></div>
                    <div><label className="lbl">Release date - optional</label><input className="inp" type="datetime-local" value={editForm.release_at} onChange={(e) => setEditForm((f) => ({ ...f, release_at: e.target.value }))} /></div>
                    <div className="flex gap-2">
                      <button className="btn-primary text-sm py-2 flex-1" onClick={() => saveEdit(chapter.id)} disabled={pending || uploadingEditVideo || !canManageVideos}>{pending ? 'Saving...' : 'Save'}</button>
                      <button
                        className="btn-secondary text-sm py-2 w-auto px-4"
                        onClick={() => {
                          setEditId(null);
                          setEditUploadProgress('');
                          setEditVideoError('');
                          setEditUploadedVideo(null);
                        }}
                      >
                        Cancel
                      </button>
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
                      {chapter.release_at && <p className="text-xs mt-0.5" style={{ color: '#fbbf24' }}>Releases {new Date(chapter.release_at).toLocaleString('en-GB')}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (!canManageVideos) {
                            setFormErr('Published course videos can only be changed or removed by an admin.');
                            return;
                          }
                          setEditId(chapter.id);
                          setEditForm({
                            title: chapter.title,
                            description: chapter.description || '',
                            video_hls_url: chapter.video_hls_url,
                            duration_seconds: chapter.duration_seconds ? String(chapter.duration_seconds) : '',
                            release_at: chapter.release_at ? new Date(chapter.release_at).toISOString().slice(0, 16) : '',
                          });
                          setEditUploadProgress('');
                          setEditVideoError('');
                          setEditUploadedVideo(null);
                        }}
                        className="!min-h-0 !min-w-0 p-1.5 rounded-lg"
                        disabled={!canManageVideos}
                        title={canManageVideos ? 'Edit chapter' : 'Admin required for published videos'}
                        style={{ background: canManageVideos ? '#222' : 'rgba(115,115,115,0.12)', color: '#a3a3a3', cursor: canManageVideos ? 'pointer' : 'not-allowed' }}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => deleteChapter(chapter.id, chapter.title)}
                        className="!min-h-0 !min-w-0 p-1.5 rounded-lg"
                        disabled={!canManageVideos}
                        title={canManageVideos ? 'Delete chapter' : 'Admin required for published videos'}
                        style={{ background: canManageVideos ? 'rgba(239,68,68,0.1)' : 'rgba(115,115,115,0.12)', color: canManageVideos ? '#ef4444' : '#737373', cursor: canManageVideos ? 'pointer' : 'not-allowed' }}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
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
            <div><label className="lbl">Title *</label><input className="inp" placeholder="e.g. Introduction to Motion" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="lbl">Description</label><input className="inp" placeholder="What this chapter covers..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <label className="lbl">Chapter video *</label>
              <input className="inp" type="file" accept="video/*" onChange={handleAddVideoChange} disabled={uploadingAddVideo || pending} />
              {addUploadProgress && <p className="text-xs mt-2" style={{ color: addUploadedVideo ? G : '#d4d4d8' }}>{addUploadProgress}</p>}
              {addUploadedVideo && (
                <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-xs font-semibold" style={{ color: G }}>Uploaded to Bunny Stream</p>
                  <p className="text-xs mt-1" style={{ color: '#d4d4d8' }}>{addUploadedVideo.fileName}</p>
                  <p className="text-xs mt-1 font-mono break-all" style={{ color: '#737373' }}>{form.video_hls_url}</p>
                </div>
              )}
              {(addVideoError || formErr) && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{addVideoError || formErr}</p>}
            </div>
            <div><label className="lbl">HLS URL (.m3u8)</label><input className="inp font-mono text-sm" placeholder="Generated automatically after upload" value={form.video_hls_url} onChange={(e) => setForm((f) => ({ ...f, video_hls_url: e.target.value }))} /></div>
            <div><label className="lbl">Duration (seconds)</label><input className="inp" type="number" placeholder="e.g. 600 for 10 min" value={form.duration_seconds} onChange={(e) => setForm((f) => ({ ...f, duration_seconds: e.target.value }))} /></div>
            <div><label className="lbl">Release date - optional</label><input className="inp" type="datetime-local" value={form.release_at} onChange={(e) => setForm((f) => ({ ...f, release_at: e.target.value }))} /></div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-2.5 flex-1" onClick={addChapter} disabled={pending || uploadingAddVideo}>{pending ? 'Adding...' : 'Add chapter'}</button>
              <button
                className="btn-secondary text-sm py-2.5 w-auto px-4"
                onClick={() => {
                  setShowAdd(false);
                  setFormErr('');
                  setForm(EMPTY_FORM);
                  setAddUploadProgress('');
                  setAddVideoError('');
                  setAddUploadedVideo(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-primary text-sm py-3" onClick={() => setShowAdd(true)}>+ Add new chapter</button>
        )}

        <div className="mt-5">
          <Link href="/instructor" className="text-xs font-semibold" style={{ color: G }}>
            Back to instructor dashboard
          </Link>
        </div>
      </div>
      <BottomNav role="instructor" />
    </div>
  );
}
