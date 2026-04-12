'use client';
import Link from 'next/link';
import { useState } from 'react';

const G = '#10B981';

const CATEGORIES = [
  { label: 'Mathematics', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z', color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Sciences', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Languages', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Geography', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', color: '#10b981', bg: '#ecfdf5' },
  { label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Commerce', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#f97316', bg: '#fff7ed' },
  { label: 'Biology', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: '#ec4899', bg: '#fdf2f8' },
  { label: 'ICT', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2', color: '#6366f1', bg: '#eef2ff' },
];

const INSTRUCTORS = [
  { name: 'Dr. James Kiromo', subject: 'Mathematics & Physics', students: 2341, courses: 8, initial: 'J', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Prof. Sarah Ali', subject: 'Chemistry & Biology', students: 1874, courses: 6, initial: 'S', color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Mr. Hassan Mwanga', subject: 'Geography & History', students: 1203, courses: 5, initial: 'H', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Mwalimu Amina Rashid', subject: 'Kiswahili & Literature', students: 987, courses: 4, initial: 'A', color: '#f59e0b', bg: '#fffbeb' },
];

const COURSES = [
  { title: 'Mathematics Form 4', instructor: 'Dr. James Kiromo', level: 'Form 4', subject: 'Mathematics', rating: 4.9, students: 2341, color: '#3b82f6', bg: '#eff6ff' },
  { title: 'Physics Mechanics', instructor: 'Prof. Sarah Ali', level: 'Form 5-6', subject: 'Physics', rating: 4.8, students: 1187, color: '#8b5cf6', bg: '#f5f3ff' },
  { title: 'PSLE Geography', instructor: 'Mr. Hassan Mwanga', level: 'Std 7', subject: 'Geography', rating: 4.7, students: 893, color: '#10b981', bg: '#ecfdf5' },
  { title: 'Kiswahili Fasihi', instructor: 'Mwalimu Amina', level: 'Form 1-4', subject: 'Kiswahili', rating: 4.9, students: 654, color: '#f59e0b', bg: '#fffbeb' },
  { title: 'Chemistry Form 3', instructor: 'Prof. Sarah Ali', level: 'Form 3', subject: 'Chemistry', rating: 4.6, students: 541, color: '#ef4444', bg: '#fef2f2' },
  { title: 'English Literature', instructor: 'Dr. James Kiromo', level: 'Form 2', subject: 'English', rating: 4.7, students: 432, color: '#6366f1', bg: '#eef2ff' },
];

function Thumb({ color, bg, subject }: { color: string; bg: string; subject: string }) {
  return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,' + bg + ',' + color + '22)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: color + '18' }} />
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{subject.charAt(0)}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: 1, position: 'relative', zIndex: 1 }}>{subject}</span>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#fff', color: '#0a0a0a' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64, padding: '0 24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: G, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            <Link href="/courses" style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderRadius: 6 }}>Browse</Link>
            <Link href="/instructor" style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderRadius: 6 }}>Teach</Link>
            <Link href="/settings" style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderRadius: 6 }}>Pricing</Link>
          </nav>
          <div style={{ flex: 1, maxWidth: 340, display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 999, padding: '8px 16px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search courses, subjects..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#0a0a0a', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#0a0a0a', textDecoration: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8 }}>Log in</Link>
            <Link href="/register" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 700, color: '#fff', background: G, textDecoration: 'none', borderRadius: 8 }}>Get started free</Link>
          </div>
          <button onClick={() => setMenuOpen(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['Browse Courses', '/courses'], ['Teach on Skolr', '/instructor'], ['Log in', '/login'], ['Get started free', '/register']].map(([l, h]) => (
              <Link key={l} href={h} style={{ padding: '12px 0', fontSize: 15, fontWeight: 500, color: '#0a0a0a', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMenuOpen(false)}>{l}</Link>
            ))}
          </div>
        )}
      </header>

      <section style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 60%,#0d2818 100%)', minHeight: 560, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '5px 14px', marginBottom: 22 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: G }}>Tanzania No.1 Learning Platform</span>
            </div>
            <h1 style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.1, color: '#fff', marginBottom: 18 }}>
              Learn at your <span style={{ color: G }}>pace</span>,<br />in your <span style={{ color: G }}>space</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 30 }}>HD lessons for Primary through University — aligned to Tanzania NECTA curriculum.</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
              <Link href="/register" style={{ padding: '13px 30px', fontSize: 15, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 10, textDecoration: 'none' }}>Start for free</Link>
              <Link href="/courses" style={{ padding: '13px 30px', fontSize: 15, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 10, textDecoration: 'none' }}>Browse courses</Link>
            </div>
            <div style={{ display: 'flex', gap: 28 }}>
              {[['10K+', 'Students'], ['500+', 'Lessons'], ['50+', 'Instructors']].map(([n, l]) => (
                <div key={l}><p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{n}</p><p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{l}</p></div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {COURSES.slice(0, 4).map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div style={{ height: 80, background: 'linear-gradient(135deg,' + c.bg + '20,' + c.color + '30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{c.subject.charAt(0)}</span>
                  </div>
                </div>
                <div style={{ padding: '9px 11px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{c.title}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{c.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderBottom: '1px solid #f3f4f6', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Aligned to:</p>
          {['NECTA', 'PSLE', 'CSEE', 'ACSEE', 'HESLB'].map(b => (
            <span key={b} style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', padding: '3px 10px', border: '1px solid #e5e7eb', borderRadius: 5 }}>{b}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <div><h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Browse by subject</h2><p style={{ fontSize: 14, color: '#6b7280' }}>Pick your subject and start learning</p></div>
          <Link href="/courses" style={{ fontSize: 13, fontWeight: 600, color: G, textDecoration: 'none' }}>View all</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.label} href={'/courses?subject=' + cat.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: cat.bg, borderRadius: 10, textDecoration: 'none', border: '1px solid ' + cat.color + '22' }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="1.8"><path d={cat.icon}/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: '#f9fafb', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <div><h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Featured courses</h2><p style={{ fontSize: 14, color: '#6b7280' }}>Most popular this month</p></div>
            <Link href="/courses" style={{ fontSize: 13, fontWeight: 600, color: G, textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {COURSES.map((c, i) => (
              <Link key={i} href="/courses" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb' }}>
                <Thumb color={c.color} bg={c.bg} subject={c.subject} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: c.color + '15', color: c.color }}>{c.level}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{c.subject}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 5 }}>{c.title}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{c.instructor}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: '#f59e0b', fontSize: 11 }}>{'★'.repeat(Math.floor(c.rating))}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>{c.rating}</span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>({c.students.toLocaleString()})</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: G }}>Free trial</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Meet our instructors</h2><p style={{ fontSize: 14, color: '#6b7280' }}>Expert teachers from Tanzania top institutions</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {INSTRUCTORS.map(inst => (
            <div key={inst.name} style={{ background: '#fff', borderRadius: 12, padding: 22, border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: inst.bg, border: '3px solid ' + inst.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: inst.color }}>{inst.initial}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{inst.name}</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>{inst.subject}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, padding: '10px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 12 }}>
                <div><p style={{ fontSize: 15, fontWeight: 800 }}>{inst.courses}</p><p style={{ fontSize: 10, color: '#9ca3af' }}>Courses</p></div>
                <div><p style={{ fontSize: 15, fontWeight: 800 }}>{inst.students.toLocaleString()}</p><p style={{ fontSize: 10, color: '#9ca3af' }}>Students</p></div>
              </div>
              <Link href="/courses" style={{ display: 'block', padding: '9px', fontSize: 12, fontWeight: 700, color: inst.color, background: inst.bg, borderRadius: 7, textDecoration: 'none' }}>View courses</Link>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#0d2818 100%)', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Start your free trial today</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 28, lineHeight: 1.6 }}>7 days free. No credit card, no M-Pesa required.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '13px 32px', fontSize: 15, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 10, textDecoration: 'none' }}>Get started free</Link>
            <Link href="/courses" style={{ padding: '13px 32px', fontSize: 15, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 10, textDecoration: 'none' }}>Browse courses</Link>
          </div>
        </div>
      </div>

      <footer style={{ background: '#0a0a0a', color: '#fff', padding: '44px 24px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 36, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 17 }}>Skolr</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 220 }}>Your pace, your space.</p>
            </div>
            {[
              { title: 'Learn', links: [['Primary', '/courses'], ['Secondary', '/courses'], ['High School', '/courses'], ['University', '/courses']] },
              { title: 'Skolr', links: [['Courses', '/courses'], ['Teach', '/instructor'], ['Free Trial', '/register'], ['Pricing', '/settings']] },
              { title: 'Support', links: [['Help', '#'], ['Contact', '#'], ['Privacy', '#'], ['Terms', '#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>{col.title}</h4>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginBottom: 8 }}>{label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            <span>2025 Skolr. All rights reserved.</span>
            <span>Made in Tanzania</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
