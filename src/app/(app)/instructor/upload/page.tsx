'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { EDUCATION_LEVELS, SUBJECTS } from '@/lib/constants';
import { uploadCourseAction } from '@/actions/courses';
import type { EducationLevel } from '@/types';

const G = '#10B981';
const LEVEL_COLORS_DARK: Record<EducationLevel, { color: string; bg: string }> = {
  primary:       { color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  secondary:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  highschool:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  undergraduate: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  masters:       { color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
};

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pending, start] = useTransition();

  const [category, setCategory] = useState<EducationLevel | ''>('');
  const [subCat,   setSubCat]   = useState('');
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [success,  setSuccess]  = useState<{ title: string } | null>(null);

  const selLevel   = EDUCATION_LEVELS.find(l => l.key === category);
  const subCats    = selLevel?.sub_categories || [];
  const selColors  = category ? LEVEL_COLORS_DARK[category as EducationLevel] : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);

    // Client-side validation
    const errs: Record<string, string> = {};
    if (!fd.get('title'))         errs.title    = 'Title is required.';
    if (!category)                errs.category = 'Education level is required.';
    if (subCats.length > 0 && !subCat) errs.sub = `Select a ${category === 'undergraduate' ? 'year' : 'form'}.`;
    if (!fd.get('subject'))       errs.subject  = 'Subject is required.';
    const hlsUrl = fd.get('video_hls_url') as string;
    if (!hlsUrl)                  errs.hls      = 'HLS URL is required.';
    else if (!hlsUrl.endsWith('.m3u8')) errs.hls = 'URL must end in .m3u8';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    fd.set('category', category);
    fd.set('sub_category', subCat);

    start(async () => {
      const result = await uploadCourseAction(fd);
      if (result?.error) { setErrors({ title: result.error }); }
      else if (result?.success) { setSuccess({ title: result.title! }); }
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="!min-h-0 !min-w-0 p-1" style={{ color: '#525252' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#fff' }}>Upload course</h1>
            <p className="text-xs" style={{ color: '#737373' }}>Starred fields are required</p>
          </div>
        </div>

        {/* Success state */}
        {success && (
          <div className="card-glow text-center py-8 mb-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <svg className="w-6 h-6" style={{ color: G }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: G }}>Course uploaded!</p>
            <p className="text-xs mb-5" style={{ color: '#737373' }}>"{success.title}" saved as draft.</p>
            <div className="flex gap-2 justify-center">
              <button className="btn-primary w-auto px-5 text-sm py-2.5" onClick={() => setSuccess(null)}>Upload another</button>
              <button className="btn-secondary w-auto px-5 text-sm py-2.5" onClick={() => router.push('/instructor')}>Dashboard</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1 — Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)', color: G }}>1</div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Course details</p>
            </div>

            <div>
              <label className="lbl">Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="inp" name="title" placeholder="e.g. Physics — Waves and Motion" />
              {errors.title && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.title}</p>}
            </div>

            <div>
              <label className="lbl">Description</label>
              <textarea className="inp resize-none" name="description" rows={3} placeholder="What students will learn in this course..." />
            </div>

            <div>
              <label className="lbl">Language</label>
              <select className="sel" name="language">
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="both">Bilingual (EN + SW)</option>
              </select>
            </div>
          </div>

          {/* Step 2 — Category */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>2</div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Category <span style={{ color: '#ef4444' }}>*</span></p>
            </div>

            <div>
              <label className="lbl">Education level <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="space-y-2">
                {EDUCATION_LEVELS.map(level => {
                  const col = LEVEL_COLORS_DARK[level.key];
                  const sel = category === level.key;
                  return (
                    <button key={level.key} type="button" onClick={() => { setCategory(level.key); setSubCat(''); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border !min-h-0 !min-w-0 !justify-start text-left transition-all"
                      style={sel ? { border: `2px solid ${col.color}`, background: col.bg } : { border: '1px solid #222', background: '#1a1a1a' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: col.bg, color: col.color }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: sel ? col.color : '#fff' }}>{level.label}</p>
                        <p className="text-xs truncate" style={{ color: '#737373' }}>{level.description}</p>
                      </div>
                      {sel && <svg className="w-4 h-4 flex-shrink-0" style={{ color: col.color }} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
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
                  {subCats.map(s => (
                    <button key={s} type="button" onClick={() => setSubCat(s)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border !min-h-0 !min-w-0 transition-all"
                      style={subCat === s
                        ? { background: selColors.color, color: '#000', border: 'none', fontWeight: 700 }
                        : { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#a3a3a3' }}>
                      {s}
                    </button>
                  ))}
                </div>
                {errors.sub && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.sub}</p>}
              </div>
            )}

            <div>
              <label className="lbl">Subject <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="sel" name="subject">
                <option value="">— Select subject —</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.subject}</p>}
            </div>
          </div>

          {/* Step 3 — Video */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>3</div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Video & media</p>
            </div>

            <div>
              <label className="lbl">HLS manifest URL (.m3u8) <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="inp font-mono text-sm" name="video_hls_url"
                placeholder="https://cdn.example.com/video/playlist.m3u8" />
              {errors.hls
                ? <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.hls}</p>
                : <p className="text-xs mt-1.5" style={{ color: '#525252' }}>Upload to Cloudflare Stream, Mux, or AWS CloudFront first, then paste the .m3u8 URL.</p>}
            </div>

            <div>
              <label className="lbl">Thumbnail URL — optional</label>
              <input className="inp" name="thumbnail_url" placeholder="https://cdn.example.com/thumb.jpg" />
            </div>

            <div>
              <label className="lbl">Duration in seconds — optional</label>
              <input className="inp" name="duration_seconds" type="number" inputMode="numeric" placeholder="e.g. 2700 for 45 minutes" />
            </div>
          </div>

          <div className="pb-6">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Saving...</span>
                : 'Save as draft'}
            </button>
            <p className="text-xs text-center mt-2" style={{ color: '#525252' }}>
              Courses save as drafts. Publish them from your Supabase dashboard.
            </p>
          </div>
        </form>
      </div>
      <BottomNav role="instructor" />
    </div>
  );
}
