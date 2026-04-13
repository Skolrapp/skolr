'use client';
import Link from 'next/link';
import { useState } from 'react';

const G = '#10B981';

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

const COURSES = [
  { title: 'Mathematics Form 4', instructor: 'Dr. James Kiromo',  level: 'Form 4',   subject: 'Mathematics', rating: 4.9, students: 2341, color: '#3b82f6', bg: '#eff6ff', route: 'secondary' },
  { title: 'Physics Mechanics',  instructor: 'Prof. Sarah Ali',   level: 'Form 5-6', subject: 'Physics',     rating: 4.8, students: 1187, color: '#8b5cf6', bg: '#f5f3ff', route: 'highschool' },
  { title: 'PSLE Geography',     instructor: 'Mr. Hassan Mwanga', level: 'Std 7',    subject: 'Geography',   rating: 4.7, students: 893,  color: '#10b981', bg: '#ecfdf5', route: 'primary' },
  { title: 'Kiswahili Fasihi',   instructor: 'Mwalimu Amina',     level: 'Form 1-4', subject: 'Kiswahili',   rating: 4.9, students: 654,  color: '#f59e0b', bg: '#fffbeb', route: 'secondary' },
  { title: 'Chemistry Form 3',   instructor: 'Prof. Sarah Ali',   level: 'Form 3',   subject: 'Chemistry',   rating: 4.6, students: 541,  color: '#ef4444', bg: '#fef2f2', route: 'secondary' },
  { title: 'English Literature', instructor: 'Dr. James Kiromo',  level: 'Form 2',   subject: 'English',     rating: 4.7, students: 432,  color: '#6366f1', bg: '#eef2ff', route: 'secondary' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
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

      <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'url(/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#0a0a0a' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,rgba(10,10,10,0.88),rgba(26,26,46,0.82),rgba(13,40,24,0.88))' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.1 }} viewBox="0 0 1280 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <circle cx="900" cy="100" r="300" fill="#10B981"/><circle cx="1100" cy="400" r="200" fill="#3b82f6"/>
          <circle cx="800" cy="350" r="150" fill="#8b5cf6"/><circle cx="1050" cy="150" r="80" fill="#10B981"/>
        </svg>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: G }}>Tanzania No.1 Learning Platform</span>
            </div>
            <h1 className="sk-hero-h1" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: '#fff', marginBottom: 18 }}>
              Learn at your <span style={{ color: G }}>pace</span>,<br />in your <span style={{ color: G }}>space</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              HD lessons for Primary through University, aligned to Tanzania NECTA curriculum.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/register" style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 10, textDecoration: 'none' }}>Start for free</Link>
              <Link href="/courses" style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 10, textDecoration: 'none' }}>Explore with preview</Link>
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
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Aligned to:</p>
          {['NECTA','PSLE','CSEE','ACSEE','HESLB'].map(b => (
            <span key={b} style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', padding: '3px 10px', border: '1px solid #e5e7eb', borderRadius: 5 }}>{b}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
        <div className="sk-section-header">
          <div><h2 className="sk-section-title">Browse by level</h2><p className="sk-section-sub">Choose your level, then pick a class before previewing lessons</p></div>
          <Link href="/courses" className="sk-section-link">View guided catalog</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
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

      <div style={{ background: '#f9fafb', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="sk-section-header">
            <div><h2 className="sk-section-title">Featured courses</h2><p className="sk-section-sub">Most popular this month</p></div>
            <Link href="/courses" className="sk-section-link">View all</Link>
          </div>
          <div className="sk-course-grid">
            {COURSES.map((course,i) => (
              <Link key={i} href={'/courses?level='+course.route} className="sk-course-card">
                <div className="sk-course-thumb" style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,'+course.bg+','+course.color+'22)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: -10, right: -10, width: 70, height: 70, borderRadius: '50%', background: course.color+'15' }} />
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: course.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <span style={{ color: '#fff', fontSize: 17, fontWeight: 800 }}>{course.subject.charAt(0)}</span>
                  </div>
                </div>
                <div className="sk-course-body" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: course.color+'15', color: course.color }}>{course.level}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{course.subject}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 5, color: '#0a0a0a' }}>{course.title}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{course.instructor}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: '#f59e0b', fontSize: 11 }}>{'★'.repeat(Math.floor(course.rating))}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>{course.rating}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: G }}>Preview first</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
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

      <div style={{ background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)', padding: '64px 24px', textAlign: 'center' }}>
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

      <style>{'@media(max-width:900px){div[style*="repeat(3,1fr)"]{grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}}@media(max-width:480px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}'}</style>
    </div>
  );
}
