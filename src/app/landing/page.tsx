import Link from 'next/link';

const G = '#10B981';
const GD = '#059669';

const COURSES = [
  { id: '1', title: 'Mathematics — Form 4 Complete Course', instructor: 'Dr. James Kiromo', rating: 4.9, reviews: 2341, price: 'TZS 8,000/mo', badge: 'Bestseller', color: '#dcfce7', stroke: '#059669', level: 'Form 4' },
  { id: '2', title: 'Physics — Mechanics & Motion (Form 5-6)', instructor: 'Prof. Sarah Ali', rating: 4.8, reviews: 1187, price: 'TZS 10,000/mo', badge: 'New', color: '#dbeafe', stroke: '#2563eb', level: 'Form 5-6' },
  { id: '3', title: 'Geography — Std 7 PSLE Preparation', instructor: 'Mr. Hassan Mwanga', rating: 4.7, reviews: 893, price: 'Free with plan', badge: 'Bestseller', color: '#fef3c7', stroke: '#d97706', level: 'Std 7' },
  { id: '4', title: 'Kiswahili — Fasihi & Lugha (Form 1-4)', instructor: 'Mwalimu Amina Rashid', rating: 4.9, reviews: 654, price: 'TZS 8,000/mo', badge: 'New', color: '#fce7f3', stroke: '#db2777', level: 'Form 1-4' },
];

const FEATURES = [
  { title: 'Zeal AI Quiz', desc: 'Our AI persona Zeal tests your understanding after every lesson and gives instant, personalised feedback on each answer.', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { title: 'HD Video Lessons', desc: 'Crystal-clear 1080p video with adaptive streaming — works smoothly on 3G, 4G, and WiFi across Tanzania.', icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  { title: 'NECTA Aligned', desc: 'Every course is built around the Tanzania national curriculum — perfect for PSLE, CSEE, and ACSEE exams.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];

const LEVELS = ['All', 'Primary (Std 1-7)', 'Secondary (Form 1-4)', 'High School', 'Undergraduate', 'Masters'];

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 12 }}>
      {'★'.repeat(Math.floor(n))}{'☆'.repeat(5 - Math.floor(n))}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#0a0a0a' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 5%' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: G, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[['Explore', '/courses'], ['Teach', '/instructor'], ['Business', '#']].map(([label, href]) => (
              <Link key={label} href={href} style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', borderRadius: 6 }}>{label}</Link>
            ))}
          </nav>
          <div style={{ flex: 1, maxWidth: 340, display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search courses, subjects, instructors..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#0a0a0a', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#0a0a0a', textDecoration: 'none', borderRadius: 6, border: '1px solid #e5e7eb' }}>Log in</Link>
            <Link href="/register" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 700, color: '#fff', background: '#0a0a0a', textDecoration: 'none', borderRadius: 6 }}>Sign up</Link>
          </div>
        </div>
      </header>

      <section style={{ position: 'relative', minHeight: 560, background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0d2818 100%)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, #10B98118 0%, transparent 50%), radial-gradient(circle at 80% 20%, #05996912 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 5%', display: 'grid', gridTemplateColumns: '480px 1fr', gap: 60, alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: G, textTransform: 'uppercase', marginBottom: 12 }}>Tanzania No. 1 Learning Platform</p>
            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, color: '#0a0a0a', marginBottom: 16 }}>Empower<br/>Your <span style={{ color: G }}>Future</span></h1>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 }}>HD lessons for every level. Learn at your pace, in your space.</p>
            <Link href="/register" style={{ display: 'block', width: '100%', padding: 16, fontSize: 16, fontWeight: 700, color: '#fff', background: '#0a0a0a', borderRadius: 10, textAlign: 'center', textDecoration: 'none', marginBottom: 12 }}>Sign Up for Free</Link>
            <Link href="/courses" style={{ display: 'block', width: '100%', padding: 15, fontSize: 16, fontWeight: 700, color: '#0a0a0a', border: '2px solid #0a0a0a', borderRadius: 10, textAlign: 'center', textDecoration: 'none' }}>Browse Courses</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Free 7-day trial · No payment required</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['10K+', 'Students enrolled'], ['500+', 'HD lessons'], ['50+', 'Expert instructors'], ['6', 'Education levels']].map(([num, label]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 34, fontWeight: 800, color: G }}>{num}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Zeal AI Quiz</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Personalized AI feedback on every answer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 5%' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Explore top courses</h2>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>Hand-picked lessons aligned to the Tanzania NECTA curriculum</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 36, scrollbarWidth: 'none' }}>
          {LEVELS.map((l, i) => (
            <span key={l} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, borderRadius: 999, border: `1.5px solid ${i === 0 ? '#0a0a0a' : '#e5e7eb'}`, background: i === 0 ? '#0a0a0a' : '#fff', color: i === 0 ? '#fff' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{l}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {COURSES.map(c => (
            <Link key={c.id} href="/courses" style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff' }}>
              <div style={{ height: 155, background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: c.badge === 'Bestseller' ? '#fef9c3' : '#dcfce7', color: c.badge === 'Bestseller' ? '#854d0e' : '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.badge}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 5 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{c.instructor}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Stars n={c.rating} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{c.rating}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>({c.reviews.toLocaleString()})</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: c.price.includes('Free') ? G : '#0a0a0a' }}>{c.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: '#f9fafb', padding: '60px 5%' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Why students choose Skolr</h2>
          <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 40 }}>Built specifically for the Tanzania education system</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d={f.icon}/></svg>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ background: '#0a0a0a', color: '#fff', padding: '48px 5% 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: G, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 20 }}>Skolr</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 240 }}>Your pace, your space.</p>
            </div>
            {[
              { title: 'Learn', links: [['Primary (Std 1-7)', '/courses'], ['Secondary (Form 1-4)', '/courses'], ['High School', '/courses'], ['Undergraduate', '/courses'], ['Masters', '/courses']] },
              { title: 'Skolr', links: [['Browse Courses', '/courses'], ['Teach on Skolr', '/instructor'], ['Subscription Plans', '/settings'], ['Free Trial', '/register']] },
              { title: 'Support', links: [['Help Center', '#'], ['Contact Us', '#'], ['Privacy Policy', '#'], ['Terms of Use', '#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</h4>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginBottom: 10 }}>{label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            <span>2025 Skolr. All rights reserved.</span>
            <span>Made in Tanzania</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
