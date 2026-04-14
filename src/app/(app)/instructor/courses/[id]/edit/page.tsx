'use client';

import { ChangeEvent, useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { EDUCATION_LEVELS, SUBJECTS } from '@/lib/constants';
import { uploadVideoToBunny } from '@/lib/bunny/client';
import type { EducationLevel } from '@/types';

const G = '#10B981';
const LEVEL_COLORS_DARK: Record<EducationLevel, { color: string; bg: string }> = {
  primary: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  secondary: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  highschool: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  undergraduate: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  masters: { color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
};

type UploadedVideo = {
  hlsUrl: string;
  durationSeconds: number;
  fileName: string;
};

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EducationLevel | ''>('');
  const [subCat, setSubCat] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<'en' | 'sw' | 'both'>('en');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailError, setThumbnailError] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [videoMetaError, setVideoMetaError] = useState<string | null>(null);

  const selLevel = EDUCATION_LEVELS.find((l) => l.key === category);
  const subCats = selLevel?.sub_categories || [];
  const selColors = category ? LEVEL_COLORS_DARK[category as EducationLevel] : null;

  useEffect(() => {
    fetch(`/api/courses/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          router.push('/instructor');
          return;
        }
        const course = d.data.course;
        setTitle(course.title || '');
        setDescription(course.description || '');
        setCategory(course.category || '');
        setSubCat(course.sub_category || '');
        setSubject(course.subject || '');
        setLanguage(course.language || 'en');
        setDurationSeconds(course.duration_seconds ? String(course.duration_seconds) : '');
        setThumbnailUrl(course.thumbnail_url || '');
        setThumbnailPreview(course.thumbnail_url || '');
        if (course.video_hls_url) {
          setUploadedVideo({
            hlsUrl: course.video_hls_url,
            durationSeconds: course.duration_seconds || 0,
            fileName: 'Current intro video',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setVideoMetaError('Please choose a video file.');
      return;
    }

    setUploadingVideo(true);
    setVideoMetaError(null);

    try {
      const uploaded = await uploadVideoToBunny(file, setUploadProgress);
      setUploadedVideo(uploaded);
      setDurationSeconds(uploaded.durationSeconds ? String(uploaded.durationSeconds) : '');
      setUploadProgress('Upload complete. Bunny is processing the stream.');
    } catch (error) {
      setVideoMetaError(error instanceof Error ? error.message : 'Upload failed.');
      setUploadProgress('');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setThumbnailError('Please choose an image file.');
      return;
    }

    setUploadingThumbnail(true);
    setThumbnailError('');
    try {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch('/api/instructor/thumbnail-upload', {
        method: 'POST',
        credentials: 'include',
        body,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload thumbnail.');
      }
      setThumbnailUrl(data.data.thumbnail_url);
      setThumbnailPreview(data.data.thumbnail_url);
    } catch (error) {
      setThumbnailError(error instanceof Error ? error.message : 'Failed to upload thumbnail.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!category) nextErrors.category = 'Education level is required.';
    if (subCats.length > 0 && !subCat) nextErrors.sub = `Select a ${category === 'undergraduate' ? 'year' : 'form'}.`;
    if (!subject) nextErrors.subject = 'Subject is required.';
    if (!uploadedVideo?.hlsUrl) nextErrors.hls = 'Upload or keep a valid intro video.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          sub_category: subCat || null,
          subject,
          video_hls_url: uploadedVideo?.hlsUrl,
          thumbnail_url: thumbnailUrl || null,
          duration_seconds: durationSeconds ? parseInt(durationSeconds, 10) : uploadedVideo?.durationSeconds || 0,
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrors({ title: data.error || 'Failed to save course.' });
        return;
      }
      setSuccess('Course intro updated.');
      setTimeout(() => setSuccess(''), 3000);
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#111111' }}>
        <div className="page"><div className="skel h-96 rounded-3xl" /></div>
        <BottomNav role="instructor" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/instructor')} className="!min-h-0 !min-w-0 p-1" style={{ color: '#525252' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#fff' }}>Edit course intro</h1>
            <p className="text-xs" style={{ color: '#737373' }}>Update your intro video, media, and draft details</p>
          </div>
        </div>

        {success && (
          <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)', color: G }}>1</div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Course details</p>
            </div>

            <div>
              <label className="lbl">Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} />
              {errors.title && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.title}</p>}
            </div>

            <div>
              <label className="lbl">Description</label>
              <textarea className="inp resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <label className="lbl">Language</label>
              <select className="sel" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'sw' | 'both')}>
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="both">Bilingual (EN + SW)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>2</div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Category</p>
            </div>

            <div>
              <label className="lbl">Education level <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="space-y-2">
                {EDUCATION_LEVELS.map((level) => {
                  const col = LEVEL_COLORS_DARK[level.key];
                  const selected = category === level.key;
                  return (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => {
                        setCategory(level.key);
                        setSubCat('');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border !min-h-0 !min-w-0 !justify-start text-left transition-all"
                      style={selected ? { border: `2px solid ${col.color}`, background: col.bg } : { border: '1px solid #222', background: '#1a1a1a' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: col.bg, color: col.color }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: selected ? col.color : '#fff' }}>{level.label}</p>
                        <p className="text-xs truncate" style={{ color: '#737373' }}>{level.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.category && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.category}</p>}
            </div>

            {subCats.length > 0 && selColors && (
              <div>
                <label className="lbl">{category === 'undergraduate' ? 'Year' : 'Form'} <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="flex flex-wrap gap-2">
                  {subCats.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubCat(s)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border !min-h-0 !min-w-0 transition-all"
                      style={subCat === s ? { background: selColors.color, color: '#000', border: 'none' } : { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#a3a3a3' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {errors.sub && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.sub}</p>}
              </div>
            )}

            <div>
              <label className="lbl">Subject <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="sel" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">- Select subject -</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.subject}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>3</div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Intro video & media</p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#171717', border: '1px solid #262626' }}>
              <label className="lbl">Replace intro video</label>
              <input className="inp" type="file" accept="video/*" onChange={handleVideoChange} disabled={uploadingVideo || pending} />
              {uploadProgress && <p className="text-xs mt-2" style={{ color: uploadedVideo ? G : '#d4d4d8' }}>{uploadProgress}</p>}
              {uploadedVideo && (
                <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-xs font-semibold" style={{ color: G }}>Current intro video</p>
                  <p className="text-xs mt-1" style={{ color: '#d4d4d8' }}>{uploadedVideo.fileName}</p>
                  <p className="text-xs mt-1 font-mono break-all" style={{ color: '#737373' }}>{uploadedVideo.hlsUrl}</p>
                </div>
              )}
              {(videoMetaError || errors.hls) && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{videoMetaError || errors.hls}</p>}
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#171717', border: '1px solid #262626' }}>
              <label className="lbl">Thumbnail image</label>
              <input className="inp" type="file" accept="image/*" onChange={handleThumbnailChange} disabled={uploadingThumbnail || pending} />
              {uploadingThumbnail && <p className="text-xs mt-2" style={{ color: '#d4d4d8' }}>Uploading thumbnail...</p>}
              {thumbnailError && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{thumbnailError}</p>}
              {thumbnailPreview && <div className="mt-3"><img src={thumbnailPreview} alt="Course thumbnail preview" className="w-full max-w-xs h-40 object-cover rounded-xl" /></div>}
            </div>

            <div>
              <label className="lbl">Duration in seconds</label>
              <input className="inp" type="number" inputMode="numeric" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary text-sm py-3 flex-1" onClick={handleSave} disabled={pending || uploadingVideo || uploadingThumbnail}>
              {pending ? 'Saving...' : 'Save changes'}
            </button>
            <button className="btn-secondary text-sm py-3 w-auto px-4" onClick={() => router.push(`/instructor/courses/${id}/chapters`)}>
              Chapters
            </button>
          </div>
        </div>
      </div>
      <BottomNav role="instructor" />
    </div>
  );
}
