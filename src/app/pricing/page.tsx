import type { Metadata } from 'next';
import Link from 'next/link';
import { FORM_FOUR_PRICE_TZS } from '@/lib/launchCatalog';

const G = '#10B981';

export const metadata: Metadata = {
  title: 'Form Four pricing | Skolr',
  description:
    'View Skolr Form Four pricing in Tanzania. Preview selected lessons for free, then continue with 15,000 TZS monthly access.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Skolr Form Four pricing',
    description:
      'Premium Form Four exam preparation with free lesson previews and 15,000 TZS monthly access.',
    url: 'https://skolr.co.tz/pricing',
  },
};

const PRICING_POINTS = [
  'Access to Form Four learning support',
  'Monthly access',
  'Mobile money payment supported',
  'Start with a free preview',
  'No confusing long-term commitment language',
] as const;

const FAQ_ITEMS = [
  ['What exactly is free?', 'Selected Form Four lesson previews are available before choosing full monthly access.'],
  ['What happens after I pay?', 'The learner continues with full monthly Form Four access across the visible subjects and progress tracking.'],
  ['Can my child study on a phone?', 'Yes. Skolr is designed to remain usable on mobile devices for everyday revision.'],
  ['Can I pay with mobile money?', 'That is the intended payment direction for families using the platform in Tanzania.'],
] as const;

export default function PricingPage() {
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#f6f7f5', color: '#0a0a0a', minHeight: '100vh' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 68, flexWrap: 'wrap', padding: '10px 0' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: G, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 18, color: '#0a0a0a' }}>Skolr</span>
              <span style={{ display: 'block', fontSize: 11, color: '#6b7280' }}>Premium Form Four exam preparation</span>
            </div>
          </Link>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '10px 16px', fontSize: 14, fontWeight: 700, color: '#0a0a0a', textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 999 }}>Log in</Link>
            <Link href="/register" style={{ padding: '10px 18px', fontSize: 14, fontWeight: 800, color: '#fff', background: G, textDecoration: 'none', borderRadius: 999 }}>Try Skolr Free</Link>
          </div>
        </div>
      </header>

      <section style={{ padding: '56px 24px 28px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: 999, padding: '6px 14px', marginBottom: 18 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={G}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Form Four launch offer</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.05, fontWeight: 900, marginBottom: 12 }}>15,000 TZS/month for structured Form Four preparation.</h1>
            <p style={{ fontSize: 17, color: '#5f6a64', maxWidth: 680, margin: '0 auto 8px', lineHeight: 1.75 }}>
              Preview selected Form Four lessons before choosing full monthly access. The public offer is simple on purpose.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 48px' }}>
        <div className="pricing-grid" style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,0.95fr) minmax(320px,0.65fr)', gap: 22, alignItems: 'start' }}>
          <div style={{ borderRadius: 28, background: '#fff', border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 18px 48px rgba(15,23,42,0.05)' }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#04959d', marginBottom: 10 }}>What is included</p>
            <h2 style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 900, marginBottom: 12 }}>Built for parents who want a clearer support layer.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#5a645f', marginBottom: 18 }}>
              Skolr is built for parents who want structure, visibility, and consistent exam preparation without depending only on tuition.
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {PRICING_POINTS.map((item) => (
                <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 14px 14px 12px', borderRadius: 18, background: '#f8fafc', border: '1px solid #edf2f7' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, background: '#ecfdf5', color: '#047857', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, lineHeight: 1.7, color: '#475569' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 28, background: 'linear-gradient(180deg,#121212 0%,#18241f 100%)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', padding: 28, boxShadow: '0 22px 56px rgba(2,6,23,0.24)' }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#86efac', marginBottom: 10 }}>Form Four monthly access</p>
            <p style={{ fontSize: 44, fontWeight: 900, marginBottom: 4 }}>{FORM_FOUR_PRICE_TZS.toLocaleString()} TZS</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.62)', marginBottom: 18 }}>/month</p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.66)' }}>Subjects</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>7 visible Form Four subjects</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.66)' }}>Access</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>Monthly</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.66)' }}>Payment</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>Mobile money friendly</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.66)' }}>Getting started</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>Free lesson preview</span>
              </div>
            </div>
            <Link href="/register" style={{ display: 'block', padding: '14px 18px', borderRadius: 16, background: G, color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
              Try Skolr Free
            </Link>
            <p style={{ fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,0.62)', marginBottom: 0 }}>
              Preview selected Form Four lessons before choosing full monthly access.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 28, background: '#fff', border: '1px solid #e5e7eb', padding: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#04959d', marginBottom: 10 }}>Pricing FAQ</p>
            <h2 style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 900, marginBottom: 16 }}>Practical answers before the decision.</h2>
            <div className="pricing-faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
              {FAQ_ITEMS.map(([question, answer]) => (
                <div key={question} style={{ borderRadius: 20, background: '#f8fafc', border: '1px solid #edf2f7', padding: 18 }}>
                  <p style={{ fontSize: 17, fontWeight: 900, color: '#111827', marginBottom: 8 }}>{question}</p>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: '#55616d' }}>{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0a0a0a', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: G, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Skolr</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>Premium Form Four exam preparation for Tanzania families.</p>
      </footer>

      <style>{`
        @media (max-width: 960px) {
          .pricing-grid,
          .pricing-faq-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
