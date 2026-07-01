import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import PublicTopNav from '@/components/public/PublicTopNav';

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
      <PublicTopNav />

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
          <Link href={ctaHref} style={{ width: '100%', maxWidth: 220, padding: '12px 18px', borderRadius: 12, background: '#0a0a0a', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 800, textAlign: 'center' }}>
            {ctaLabel}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
