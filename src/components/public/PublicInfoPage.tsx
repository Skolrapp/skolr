import Link from 'next/link';
import Footer from '@/components/layout/Footer';

const G = '#10B981';

type Section = {
  title: string;
  body: string;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
  ctaLabel?: string;
  ctaHref?: string;
};

export default function PublicInfoPage({ eyebrow, title, description, sections, ctaLabel = 'Browse courses', ctaHref = '/courses' }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0a0a0a', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <div style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0a0a0a' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>Skolr</p>
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Master Form Four. Pass with Confidence.</p>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{ padding: '9px 14px', borderRadius: 999, border: '1px solid #d1d5db', color: '#334155', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Pricing</Link>
            <Link href="/register" style={{ padding: '9px 14px', borderRadius: 999, background: G, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Start for Free</Link>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 20px 56px' }}>
        <section style={{ marginBottom: 28, padding: '28px 24px', borderRadius: 24, background: 'linear-gradient(135deg,#0f172a,#10231a)', color: '#fff' }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#86efac', marginBottom: 10 }}>{eyebrow}</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,48px)', lineHeight: 1.05, fontWeight: 900, marginBottom: 14 }}>{title}</h1>
          <p style={{ maxWidth: 760, fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>{description}</p>
        </section>

        <section style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
          {sections.map((section) => (
            <article key={section.title} style={{ borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', padding: '20px 18px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{section.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#4b5563', whiteSpace: 'pre-line' }}>{section.body}</p>
            </article>
          ))}
        </section>

        <section style={{ borderRadius: 22, border: '1px solid #dbeafe', background: 'linear-gradient(135deg,#eff6ff,#ecfdf5)', padding: '22px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Ready to keep exploring Skolr?</p>
            <p style={{ fontSize: 14, color: '#4b5563' }}>Move back into the catalog, pricing, or registration flow without hitting a dead end.</p>
          </div>
          <Link href={ctaHref} style={{ padding: '12px 18px', borderRadius: 12, background: '#0a0a0a', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 800 }}>
            {ctaLabel}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
