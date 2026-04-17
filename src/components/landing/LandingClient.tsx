'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Course } from '@/types';

const G = '#10B981';
const LANDING_COURSES_CACHE_KEY = 'skolr:landing:courses';
const LANDING_BRANDING_CACHE_KEY = 'skolr:landing:branding';
let landingCoursesCache: Course[] | null = null;
let landingBrandingCache: Record<string, string | null> | null = null;

type LandingClientProps = {
  initialCourses: Course[];
  initialBanners: Record<string, string | null>;
};

const LEVELS = [
  { label: 'Primary',      sub: 'Standard 1 - 7',   level: 'primary',       color: '#3b82f6', bg: '#eff6ff', count: '120+ lessons', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { label: 'Secondary',    sub: 'Form 1 - 4',        level: 'secondary',     color: '#8b5cf6', bg: '#f5f3ff', count: '180+ lessons', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'High School',  sub: 'Form 5 - 6',        level: 'highschool',    color: '#f59e0b', bg: '#fffbeb', count: '90+ lessons',  icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { label: 'University',   sub: 'Undergraduate',     level: 'undergraduate', color: '#10b981', bg: '#ecfdf5', count: '60+ lessons',  icon: 'M12 14l9-5-9-5-9 5 9 5z' },
  { label: 'Masters',      sub: 'Postgraduate',      level: 'masters',       color: '#ef4444', bg: '#fef2f2', count: '40+ lessons',  icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { label: 'Professional', sub: 'CPA, ACCA and more', level: '',             color: '#6366f1', bg: '#eef2ff', count: 'Coming soon', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

const INSTRUCTORS = [
  { name: 'Dr. James Kiromo',     subject: 'Mathematics & Physics',  students: 2341, courses: 8, initial: 'J', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Prof. Sarah Ali',      subject: 'Chemistry & Biology',    students: 1874, courses: 6, initial: 'S', color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Mr. Hassan Mwanga',    subject: 'Geography & History',    students: 1203, courses: 5, initial: 'H', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Mwalimu Amina Rashid', subject: 'Kiswahili & Literature', students: 987,  courses: 4, initial: 'A', color: '#f59e0b', bg: '#fffbeb' },
];

export default function LandingClient({ initialCourses, initialBanners }: LandingClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(landingCoursesCache || initialCourses);
  const [banners, setBanners] = useState<Record<string, string | null>>(landingBrandingCache || initialBanners);

  useEffect(() => {
    let shouldFetchCourses = initialCourses.length === 0;
    let shouldFetchBranding = Object.keys(initialBanners).length === 0;

    if (typeof window !== 'undefined') {
      if (!landingCoursesCache && initialCourses.length > 0) {
        landingCoursesCache = initialCourses;
        window.sessionStorage.setItem(LANDING_COURSES_CACHE_KEY, JSON.stringify(initialCourses));
        shouldFetchCourses = false;
      }

      if (!landingBrandingCache && Object.keys(initialBanners).length > 0) {
        landingBrandingCache = initialBanners;
        window.sessionStorage.setItem(LANDING_BRANDING_CACHE_KEY, JSON.stringify(initialBanners));
        shouldFetchBranding = false;
      }

      if (!landingCoursesCache) {
        const cachedCourses = window.sessionStorage.getItem(LANDING_COURSES_CACHE_KEY);
        if (cachedCourses) {
          try {
            const parsed = JSON.parse(cachedCourses) as Course[];
            landingCoursesCache = parsed;
            setCourses(parsed);
            shouldFetchCourses = false;
          } catch {}
        }
      } else {
        shouldFetchCourses = false;
      }

      if (!landingBrandingCache) {
        const cachedBranding = window.sessionStorage.getItem(LANDING_BRANDING_CACHE_KEY);
        if (cachedBranding) {
          try {
            const parsed = JSON.parse(cachedBranding) as Record<string, string | null>;
            landingBrandingCache = parsed;
            setBanners(parsed);
            shouldFetchBranding = false;
          } catch {}
        }
      } else {
        shouldFetchBranding = false;
      }
    }

    const pendingRequests: Array<Promise<unknown>> = [];
    if (shouldFetchCourses) pendingRequests.push(fetch('/api/courses?per_page=6').then((r) => r.json()));
    if (shouldFetchBranding) pendingRequests.push(fetch('/api/site/branding').then((r) => r.json()));
    if (!pendingRequests.length) return;

    Promise.allSettled(pendingRequests).then((results) => {
      const coursesResult = shouldFetchCourses ? results.shift() : null;
      const brandingResult = shouldFetchBranding ? results.shift() : null;

      if (coursesResult && coursesResult.status === 'fulfilled' && (coursesResult.value as any).success) {
        const nextCourses = (coursesResult.value as any).data.items || [];
        landingCoursesCache = nextCourses;
        setCourses(nextCourses);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(LANDING_COURSES_CACHE_KEY, JSON.stringify(nextCourses));
        }
      }

      if (brandingResult && brandingResult.status === 'fulfilled' && (brandingResult.value as any).success) {
        const nextBanners = (brandingResult.value as any).data.banners || {};
        landingBrandingCache = nextBanners;
        setBanners(nextBanners);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(LANDING_BRANDING_CACHE_KEY, JSON.stringify(nextBanners));
        }
      }
    });
  }, [initialBanners, initialCourses]);
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#fff', color: '#0a0a0a' }}>

      <header className="sk-header">
        <div className="sk-header-inner">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: G, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <nav className="desktop-only" style={{ display: 'flex', gap: 4, flex: 1 }}>
            <Link href="/login" style={{ padding: '7px 12px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderRadius: 6 }}>Teach</Link>
            <Link href="/pricing" style={{ padding: '7px 12px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderRadius: 6 }}>Pricing</Link>
          </nav>
          <div className="sk-header-search desktop-only">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 999, padding: '7px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search courses..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#0a0a0a', width: '100%', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#0a0a0a', textDecoration: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8 }}>Log in</Link>
            <Link href="/register" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 700, color: '#fff', background: G, textDecoration: 'none', borderRadius: 8 }}>Get started free</Link>
          </div>
          <button className="sk-hamburger" onClick={() => setMenuOpen(m => !m)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
        <div className="sk-mobile-search">
          <div className="sk-mobile-search-inner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search courses..." />
          </div>
        </div>
        {menuOpen && (
          <div className="sk-drawer open">
            <div className="sk-drawer-overlay" onClick={() => setMenuOpen(false)} />
            <div className="sk-drawer-panel">
              <div style={{ padding: '16px 20px 20px', borderBottom: '1px solid #f3f4f6', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, background: G, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 18, color: '#0a0a0a' }}>Skolr</span>
                </div>
              </div>
              <Link href="/courses" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>Browse Courses</Link>
              <Link href="/courses?level=primary" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>Primary (choose Std first)</Link>
              <Link href="/courses?level=secondary" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>Secondary (choose Form first)</Link>
              <Link href="/courses?level=highschool" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>High School (choose Form first)</Link>
              <Link href="/courses?level=undergraduate" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>University (choose Year first)</Link>
              <Link href="/pricing" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>Pricing</Link>
              <Link href="/login" className="sk-drawer-item" onClick={() => setMenuOpen(false)}>Teach on Skolr</Link>
              <div style={{ margin: '12px 20px', borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login" style={{ display: 'block', padding: '11px', fontSize: 14, fontWeight: 600, color: '#0a0a0a', textDecoration: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, textAlign: 'center' }}>Log in</Link>
                <Link href="/register" style={{ display: 'block', padding: '11px', fontSize: 14, fontWeight: 700, color: '#fff', background: G, textDecoration: 'none', borderRadius: 8, textAlign: 'center' }}>Get started free</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="sk-hero-section" style={{ position: 'relative', minHeight: 600, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: banners['hero-banner']
              ? `url(${banners['hero-banner']}) center/cover no-repeat`
              : 'linear-gradient(135deg,#08110e,#101725 48%,#0d2a1d)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,rgba(3,8,18,0.36),rgba(7,15,28,0.22) 42%,rgba(8,31,23,0.24))' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(4,8,14,0.12),rgba(4,8,14,0.06) 28%,rgba(4,8,14,0.34) 100%)' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.14 }} viewBox="0 0 1280 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <circle cx="900" cy="100" r="300" fill="#10B981"/><circle cx="1100" cy="400" r="200" fill="#3b82f6"/>
          <circle cx="800" cy="350" r="150" fill="#8b5cf6"/><circle cx="1050" cy="150" r="80" fill="#10B981"/>
        </svg>
        <div className="sk-shell sk-hero-shell" style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 760, background: 'linear-gradient(135deg,rgba(4,10,18,0.76),rgba(4,10,18,0.4))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 70px rgba(2,6,23,0.34)', backdropFilter: 'blur(10px)', borderRadius: 30, padding: '28px 28px 30px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: G }}>Tanzania No.1 Learning Platform</span>
            </div>
            <h1 className="sk-hero-h1" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: '#fff', marginBottom: 18, textShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
              Learn at your <span style={{ color: G }}>pace</span>,<br />in your <span style={{ color: G }}>space</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, textShadow: '0 8px 24px rgba(0,0,0,0.32)' }}>
              HD lessons for Primary through University, aligned to Tanzania NECTA curriculum.
            </p>
            <div className="sk-hero-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link className="sk-hero-action-primary" href="/register" style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 10, textDecoration: 'none' }}>Start for free</Link>
              <Link className="sk-hero-action-secondary" href="/courses" style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 10, textDecoration: 'none' }}>Explore with preview</Link>
            </div>
            <div className="sk-banner-stats" style={{ display: 'flex', gap: 28 }}>
              {[['10K+','Students'],['500+','Lessons'],['50+','Instructors']].map(([n,l]) => (
                <div key={l}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{n}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderBottom: '1px solid #f3f4f6', padding: '14px 24px' }}>
        <div className="sk-shell sk-alignment-strip" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Aligned to:</p>
          {['NECTA','PSLE','CSEE','ACSEE','HESLB'].map(b => (
            <span key={b} style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', padding: '3px 10px', border: '1px solid #e5e7eb', borderRadius: 5 }}>{b}</span>
          ))}
        </div>
      </div>

      <div className="sk-shell sk-section-shell" style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
        <div className="sk-section-header">
          <div><h2 className="sk-section-title">Browse by level</h2><p className="sk-section-sub">Choose your level, then pick a class before previewing lessons</p></div>
          <Link href="/courses" className="sk-section-link">View guided catalog</Link>
        </div>
        <div className="sk-level-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {LEVELS.map(lv => (
            <Link key={lv.label} href={lv.level ? '/courses?level='+lv.level : '#'}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', background: lv.bg, borderRadius: 14, textDecoration: 'none', border: '1px solid '+lv.color+'22', color: 'inherit', opacity: lv.level ? 1 : 0.6 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px '+lv.color+'25' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={lv.color} strokeWidth="1.8"><path d={lv.icon}/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0a', marginBottom: 2 }}>{lv.label}</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>{lv.sub}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: lv.color }}>{lv.level ? 'Choose class + preview' : lv.count}</span>
              </div>
              {lv.level && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lv.color} strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 56px' }}>
        <div className="sk-shell" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            className="sk-hook-banner"
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 30,
              padding: '34px 36px',
              background: 'linear-gradient(135deg,#07111f 0%,#0d2034 48%,#0d3726 100%)',
              boxShadow: '0 30px 80px rgba(15,23,42,0.12)',
            }}
          >
            <div style={{ position: 'absolute', top: -80, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(16,185,129,0.18)' }} />
            <div style={{ position: 'absolute', bottom: -120, left: '28%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(59,130,246,0.12)' }} />
            <div className="sk-hook-banner-grid" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(280px,0.8fr)', gap: 22, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 18 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: G }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5' }}>Why parents and learners stay on Skolr</span>
                </div>
                <h2 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.08, color: '#fff', marginBottom: 12 }}>
                  Give every learner a sharper start before the next exam window opens.
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: 620, marginBottom: 24 }}>
                  Preview lessons instantly, move from class to class with confidence, and turn revision time into a steady study routine that feels easier to keep.
                </p>
                <div className="sk-hook-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/register" style={{ padding: '13px 26px', borderRadius: 12, background: '#fff', color: '#0a0a0a', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                    Start free trial
                  </Link>
                  <Link href="/pricing" style={{ padding: '13px 26px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}>
                    See plans
                  </Link>
                </div>
              </div>
              <div className="sk-hook-proof-grid" style={{ display: 'grid', gap: 12 }}>
                {[
                  ['Free lesson previews', 'Let visitors feel the teaching quality before they commit.'],
                  ['Class-by-class guidance', 'Parents can choose the exact level that fits the learner today.'],
                  ['Study momentum', 'Short, focused lessons help learners come back consistently.'],
                ].map(([title, copy], index) => (
                  <div
                    key={title}
                    style={{
                      padding: '18px 18px 16px',
                      borderRadius: 20,
                      background: index === 1 ? 'rgba(16,185,129,0.16)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{title}</p>
                    <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.68)' }}>{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#f9fafb', padding: '56px 24px' }}>
        <div className="sk-shell sk-section-shell" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="sk-section-header">
            <div><h2 className="sk-section-title">Featured courses</h2><p className="sk-section-sub">Most popular this month</p></div>
            <Link href="/courses" className="sk-section-link">View all</Link>
          </div>
          <div className="sk-course-grid">
            {courses.map((course,i) => {
              const levelMeta = LEVELS.find((item) => item.level === course.category) || LEVELS[0];
              return (
              <Link key={course.id || i} href={'/courses/'+course.id} className="sk-course-card">
                <div className="sk-course-thumb" style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,'+levelMeta.bg+','+levelMeta.color+'22)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <div style={{ position: 'absolute', top: -10, right: -10, width: 70, height: 70, borderRadius: '50%', background: levelMeta.color+'15' }} />
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: levelMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <span style={{ color: '#fff', fontSize: 17, fontWeight: 800 }}>{course.subject.charAt(0)}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="sk-course-body" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: levelMeta.color+'15', color: levelMeta.color }}>{course.sub_category || course.category}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{course.subject}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 5, color: '#0a0a0a' }}>{course.title}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{course.instructor_name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: '#f59e0b', fontSize: 11 }}>★★★★★</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>4.8</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: G }}>Preview first</span>
                  </div>
                </div>
              </Link>
            );})}
          </div>
        </div>
      </div>

      <div className="sk-shell sk-section-shell" style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div
          className="sk-campaign-banner"
          style={{
            width: '100%',
            aspectRatio: '1600 / 760',
            borderRadius: 30,
            overflow: 'hidden',
            position: 'relative',
            background: banners['campaign-banner']
              ? `url(${banners['campaign-banner']}) center/cover no-repeat`
              : 'linear-gradient(135deg,#0b1324,#11253b 48%,#103d2b)',
            boxShadow: '0 30px 80px rgba(15,23,42,0.12)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(7,10,20,0.28),rgba(7,10,20,0.12) 48%,rgba(8,27,19,0.18))' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(7,10,20,0.16),rgba(7,10,20,0.08) 38%,rgba(8,27,19,0.24) 100%)' }} />
        </div>
      </div>

      <div style={{ background: '#fff', padding: '0 24px 64px' }}>
        <div className="sk-shell" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="sk-conviction-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              {
                slot: 'message-placeholder-1',
                title: <>Stay in <span style={{ color: '#2f6a5f' }}>control</span><br />of your child&apos;s<br />education</>,
                copy: 'Skolr organizes your child’s learning so they never fall behind.',
                action: 'Start Learning Now',
                href: '/register',
                fallback: 'linear-gradient(180deg,#f3f0f2 0%,#efedf0 100%)',
                color: '#1f2937',
                buttonBackground: '#2f6a5f',
                buttonColor: '#fff',
                buttonBorder: 'none',
              },
              {
                slot: 'message-placeholder-2',
                title: <>From <span style={{ color: '#2f6a5f' }}>confusion</span><br />to clear<br /><span style={{ color: '#2f6a5f' }}>learning paths</span></>,
                copy: 'Every topic is structured step by step so your child knows what to learn next.',
                action: 'See How It Works',
                href: '/courses',
                fallback: 'linear-gradient(180deg,#eef7f3 0%,#dceee8 100%)',
                color: '#1f2937',
                buttonBackground: 'rgba(255,255,255,0.72)',
                buttonColor: '#2f6a5f',
                buttonBorder: '1.5px solid rgba(47,106,95,0.65)',
              },
              {
                slot: 'message-placeholder-3',
                title: <>Not more<br />content.<br /><span style={{ color: '#b9e2d1' }}>Better structure.</span></>,
                copy: 'No scattered videos — just a clear path from topic to mastery.',
                action: 'Get Started',
                href: '/register',
                fallback: 'linear-gradient(180deg,#1d2d29 0%,#203733 100%)',
                color: '#f8fafc',
                buttonBackground: 'linear-gradient(135deg,#d8f5e8,#b8e6d4)',
                buttonColor: '#22433b',
                buttonBorder: 'none',
              },
            ].map((card, index) => (
              <div
                key={card.slot}
                style={{
                  minHeight: 605,
                  borderRadius: 0,
                  padding: '42px 26px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: banners[card.slot]
                    ? `linear-gradient(180deg,rgba(255,255,255,${index === 2 ? 0.06 : 0.4}) 0%,rgba(255,255,255,${index === 2 ? 0.04 : 0.18}) 100%), url(${banners[card.slot]}) center/cover`
                    : card.fallback,
                  color: card.color,
                  border: index === 0 ? '1px solid #ece7ea' : 'none',
                }}
              >
                {index === 2 && (
                  <svg
                    viewBox="0 0 400 220"
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 220, opacity: 0.45 }}
                  >
                    <path d="M-20 200 C 40 160, 70 160, 120 120 S 220 70, 280 110 S 360 165, 430 130" stroke="rgba(210,235,226,0.8)" strokeWidth="3" fill="none" />
                    <path d="M-30 235 C 25 210, 70 170, 120 180 S 220 230, 300 190 S 360 130, 430 145" stroke="rgba(210,235,226,0.38)" strokeWidth="2" fill="none" />
                    {[70, 145, 225, 300].map((x, circleIndex) => (
                      <circle key={x} cx={x} cy={[176, 126, 145, 102][circleIndex]} r="5" fill="rgba(210,235,226,0.72)" />
                    ))}
                  </svg>
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: 28, lineHeight: 1.22, fontWeight: 800, marginBottom: 28, letterSpacing: '-0.03em' }}>{card.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.75, maxWidth: 240, color: index === 2 ? 'rgba(248,250,252,0.78)' : '#374151' }}>{card.copy}</p>
                </div>
                <div style={{ position: 'relative', zIndex: 1, marginTop: 26 }}>
                  <Link
                    href={card.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      minHeight: 42,
                      padding: '0 18px',
                      borderRadius: 8,
                      background: card.buttonBackground,
                      color: card.buttonColor,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      border: card.buttonBorder,
                      boxShadow: index === 2 ? '0 12px 25px rgba(8,31,23,0.22)' : 'none',
                    }}
                  >
                    {card.action}
                    {index === 1 && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sk-shell sk-section-shell" style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
        <div className="sk-section-header">
          <div><h2 className="sk-section-title">Meet our instructors</h2><p className="sk-section-sub">Expert teachers from Tanzania top institutions</p></div>
        </div>
        <div className="sk-instructor-grid">
          {INSTRUCTORS.map(inst => (
            <div key={inst.name} style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: inst.bg, border: '3px solid '+inst.color+'30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: inst.color }}>{inst.initial}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 3 }}>{inst.name}</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>{inst.subject}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '10px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 14 }}>
                <div><p style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0a' }}>{inst.courses}</p><p style={{ fontSize: 10, color: '#9ca3af' }}>Courses</p></div>
                <div><p style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0a' }}>{inst.students.toLocaleString()}</p><p style={{ fontSize: 10, color: '#9ca3af' }}>Students</p></div>
              </div>
              <Link href="/courses" style={{ display: 'block', padding: '9px', fontSize: 12, fontWeight: 700, color: inst.color, background: inst.bg, borderRadius: 8, textDecoration: 'none' }}>View courses</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="sk-cta-band" style={{ background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Start your free trial today</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 28, lineHeight: 1.6 }}>7 days free. No credit card, no M-Pesa required.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '13px 32px', fontSize: 15, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 10, textDecoration: 'none' }}>Get started free</Link>
            <Link href="/pricing" style={{ padding: '13px 32px', fontSize: 15, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 10, textDecoration: 'none' }}>View pricing</Link>
          </div>
        </div>
      </div>

      <footer className="sk-footer">
        <div className="sk-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 17 }}>Skolr</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 220 }}>Your pace, your space.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>Learn</h4>
            {[['Primary','/courses?level=primary'],['Secondary','/courses?level=secondary'],['High School','/courses?level=highschool'],['University','/courses?level=undergraduate']].map(([l,h]) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginBottom: 9 }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>Skolr</h4>
            {[['All Courses','/courses'],['Teach on Skolr','/login'],['Free Trial','/register'],['Pricing','/pricing']].map(([l,h]) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginBottom: 9 }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>Support</h4>
            {[['Help','#'],['Contact','#'],['Privacy','#'],['Terms','#']].map(([l,h]) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginBottom: 9 }}>{l}</Link>
            ))}
          </div>
        </div>
        <div className="sk-footer-bottom">
          <span>2025 Skolr. All rights reserved.</span>
          <span>Made in Tanzania</span>
        </div>
      </footer>

      <style>{`
        .sk-shell {
          width: 100%;
          padding-left: 24px;
          padding-right: 24px;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .sk-premium-placeholder-grid,
          .sk-conviction-strip,
          .sk-hook-banner-grid,
          .sk-level-grid,
          .sk-campaign-banner-grid {
            grid-template-columns: 1fr !important;
          }
          .sk-hero-section {
            min-height: auto !important;
          }
          .sk-hero-shell,
          .sk-section-shell {
            padding-top: 40px !important;
            padding-bottom: 40px !important;
          }
          .sk-banner-stats {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px !important;
          }
          .sk-hook-proof-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .sk-shell {
            padding-left: 16px;
            padding-right: 16px;
          }
          .sk-hero-h1 {
            font-size: 34px !important;
            line-height: 1.05 !important;
          }
          .sk-hero-shell {
            padding-top: 28px !important;
            padding-bottom: 28px !important;
          }
          .sk-hero-shell > div:first-child {
            padding: 22px 18px 24px !important;
            border-radius: 24px !important;
          }
          .sk-hero-actions {
            display: grid !important;
            grid-template-columns: 1fr;
          }
          .sk-hero-action-primary,
          .sk-hero-action-secondary {
            width: 100%;
            text-align: center;
          }
          .sk-banner-stats {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .sk-banner-stats > div,
          .sk-campaign-banner,
          .sk-conviction-strip > div,
          .sk-course-grid > a,
          .sk-instructor-grid > div {
            border-radius: 20px !important;
          }
          .sk-alignment-strip {
            gap: 8px !important;
          }
          .sk-level-grid > a {
            padding: 16px !important;
          }
          .sk-hook-banner {
            padding: 24px 18px !important;
            border-radius: 24px !important;
          }
          .sk-hook-actions {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .sk-hook-actions a {
            width: 100%;
            text-align: center;
          }
          .sk-campaign-banner {
            aspect-ratio: 1600 / 760 !important;
          }
          .sk-conviction-strip > div {
            min-height: auto !important;
            padding: 28px 20px 22px !important;
            border-radius: 24px !important;
          }
          .sk-cta-band {
            padding: 48px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
