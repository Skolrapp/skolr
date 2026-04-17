import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Course detail mockup',
  description: 'Prototype page for the future Skolr course detail experience.',
  alternates: {
    canonical: '/course-detail-mockup',
  },
};

const G = '#10B981';

const OUTCOMES = [
  'Understand core NECTA-aligned algebra topics from simple expressions to simultaneous equations.',
  'See worked examples before each guided practice section.',
  'Know exactly which lessons to finish before moving to the next exam topic.',
  'Track learner progress by chapter with parent-friendly visibility.',
];

const LESSONS = [
  { title: 'Introduction to algebraic thinking', duration: '08 min', preview: true },
  { title: 'Like terms and simplifying expressions', duration: '14 min', preview: true },
  { title: 'Expanding brackets and factorisation', duration: '17 min', preview: false },
  { title: 'Linear equations step by step', duration: '19 min', preview: false },
  { title: 'Simultaneous equations and exam shortcuts', duration: '21 min', preview: false },
  { title: 'End-of-topic quiz and worked revision paper', duration: '12 min', preview: false },
];

const REVIEWS = [
  {
    name: 'Parent of Form 2 learner',
    text: 'The chapter order makes sense. My child now knows what to learn next instead of jumping between random videos.',
    rating: 5,
  },
  {
    name: 'Asha, Form 2 student',
    text: 'I liked that the teacher shows each step before the quiz. The preview helped me decide to subscribe.',
    rating: 4,
  },
];

export default function CourseDetailMockupPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: '#0a0a0a', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(14px)', background: 'rgba(247,248,250,0.88)', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid #dbe0e7', color: '#334155', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>View pricing</Link>
            <Link href="/register" style={{ padding: '10px 16px', borderRadius: 999, background: G, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Start free trial</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px 80px' }}>
        <section className="course-detail-hero" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'stretch', marginBottom: 28 }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, padding: '28px 28px 32px', background: 'linear-gradient(140deg,#08110e,#0d1724 42%,#0f3a2a)', minHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(16,185,129,0.22), transparent 36%), radial-gradient(circle at bottom left, rgba(59,130,246,0.18), transparent 32%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 0.4 }}>Secondary</span>
                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.18)', color: '#d1fae5', fontSize: 11, fontWeight: 800 }}>Form 2 Mathematics</span>
                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 800 }}>Preview available</span>
              </div>
              <h1 style={{ fontSize: 42, lineHeight: 1.08, fontWeight: 900, color: '#fff', marginBottom: 14 }}>
                Algebra Foundations for
                <br />
                Form 2 learners
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(255,255,255,0.78)', maxWidth: 620, marginBottom: 24 }}>
                This mockup shows how Skolr could explain one course clearly before a learner subscribes:
                what they will learn, who teaches it, which lessons are free to preview, and why a parent should trust the structure.
              </p>
              <div className="course-detail-hero-stats" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  ['24 lessons', 'Structured chapters'],
                  ['4.8 / 5', 'Parent and learner rating'],
                  ['3 preview clips', 'Watch before subscribing'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{value}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="course-detail-hero-actions" style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
              <button style={{ padding: '14px 18px', border: 'none', borderRadius: 14, background: '#fff', color: '#0a0a0a', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Watch free preview</button>
              <button style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>See lesson outline</button>
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', boxShadow: '0 18px 50px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/10', background: 'linear-gradient(135deg,#def7ec,#eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(16,185,129,0.14)' }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill={G}><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#0f172a', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                  Preview lesson 1
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6 }}>Teacher</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginTop: 3 }}>Mwl. Esther Mushi</p>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>EM</div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', marginBottom: 16 }}>
                  Secondary maths teacher with 11 years of NECTA preparation experience and a strong reputation for step-by-step exam revision.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ padding: '7px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700 }}>NECTA-aligned</span>
                  <span style={{ padding: '7px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700 }}>Worked examples</span>
                  <span style={{ padding: '7px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700 }}>Quiz after lesson</span>
                </div>
              </div>
            </div>

            <div style={{ borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', boxShadow: '0 18px 50px rgba(15,23,42,0.06)', padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Conversion card</p>
              <p style={{ fontSize: 24, lineHeight: 1.15, fontWeight: 900, color: '#0a0a0a', marginBottom: 10 }}>Why this page matters</p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#64748b', marginBottom: 14 }}>
                Instead of sending visitors straight into the watch page, this layout gives them enough trust and clarity to decide whether to start a free trial.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', fontSize: 13, lineHeight: 1.8 }}>
                <li>Clear outcomes before commitment</li>
                <li>Preview access without full subscription</li>
                <li>Teacher credibility and lesson structure</li>
                <li>Parent-friendly CTA and plan visibility</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="course-detail-body" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', padding: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>What learners will achieve</p>
              <div className="course-detail-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                {OUTCOMES.map((item) => (
                  <div key={item} style={{ borderRadius: 18, padding: '16px 16px 16px 14px', background: '#f8fafc', border: '1px solid #ecf0f4', display: 'flex', gap: 12 }}>
                    <div style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 999, background: '#dcfce7', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>✓</div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#334155' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Lesson outline</p>
                  <h2 style={{ fontSize: 28, lineHeight: 1.12, fontWeight: 900, color: '#0a0a0a', margin: 0 }}>A chapter list that sells the value</h2>
                </div>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>6 chapters in this example</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LESSONS.map((lesson, index) => (
                  <div key={lesson.title} style={{ borderRadius: 18, padding: '14px 16px', background: lesson.preview ? '#f0fdf4' : '#f8fafc', border: `1px solid ${lesson.preview ? '#bbf7d0' : '#ecf0f4'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: lesson.preview ? '#10B981' : '#e2e8f0', color: lesson.preview ? '#fff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0a0a0a' }}>{lesson.title}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{lesson.duration} • {lesson.preview ? 'Free preview' : 'Subscriber lesson'}</p>
                      </div>
                    </div>
                    <button style={{ padding: '10px 14px', borderRadius: 999, border: lesson.preview ? 'none' : '1px solid #dbe3eb', background: lesson.preview ? '#0a0a0a' : '#fff', color: lesson.preview ? '#fff' : '#475569', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                      {lesson.preview ? 'Watch preview' : 'Locked'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', padding: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Social proof</p>
              <h2 style={{ fontSize: 28, lineHeight: 1.12, fontWeight: 900, color: '#0a0a0a', margin: '0 0 16px' }}>Reviews that reduce hesitation</h2>
              <div className="course-detail-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
                {REVIEWS.map((review) => (
                  <div key={review.name} style={{ borderRadius: 18, padding: 18, background: '#f8fafc', border: '1px solid #ecf0f4' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0a0a0a' }}>{review.name}</p>
                    <p style={{ margin: '6px 0 10px', fontSize: 13, letterSpacing: 1, color: '#f59e0b' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#475569' }}>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ position: 'sticky', top: 94, borderRadius: 24, background: '#fff', border: '1px solid #e6eaf0', boxShadow: '0 18px 50px rgba(15,23,42,0.06)', padding: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: G, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Subscription panel</p>
              <h3 style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: '#0a0a0a', margin: '0 0 8px' }}>Start free, then continue</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b', marginBottom: 18 }}>
                This right column can stay visible while the user reads the course. It should make the decision easy, not noisy.
              </p>
              <div style={{ borderRadius: 18, padding: 16, background: '#f8fafc', border: '1px solid #ecf0f4', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Plan</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>Secondary Family</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Price</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>TZS 8,000 / month</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Includes</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>Preview, quizzes, progress</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={{ padding: '14px 16px', borderRadius: 14, border: 'none', background: G, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Start 7-day free trial</button>
                <button style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid #dbe3eb', background: '#fff', color: '#334155', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>View plan details</button>
              </div>
              <p style={{ marginTop: 12, fontSize: 12, lineHeight: 1.65, color: '#64748b' }}>
                Parent accounts can subscribe once, then switch between learner profiles without paying again.
              </p>
            </div>
          </aside>
        </section>

        <section style={{ marginTop: 28, borderRadius: 28, background: 'linear-gradient(135deg,#0b1220,#0b1b14 52%,#113b2a)', padding: '28px 24px', color: '#fff' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#86efac', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Mockup summary</p>
          <h2 style={{ fontSize: 30, lineHeight: 1.08, fontWeight: 900, margin: '0 0 10px' }}>What this page would do better than the current flow</h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.76)', maxWidth: 920, margin: 0 }}>
            It would give the visitor a full decision page before they try to watch the course: enough structure to build trust, enough preview to create desire, and a clear subscription action for either a learner or a parent.
          </p>
        </section>
      </main>

    </div>
  );
}
