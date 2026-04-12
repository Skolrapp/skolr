import Link from 'next/link';

const G = '#10B981';

const PLANS = [
  { id: 'primary_only',      name: 'Primary',       price: 9000,  annual: 89500,  color: '#3b82f6', bg: '#eff6ff', levels: ['Primary (Std 1-7)'],                       popular: false },
  { id: 'secondary_only',    name: 'Secondary',     price: 8000,  annual: 80000,  color: '#8b5cf6', bg: '#f5f3ff', levels: ['Secondary (Form 1-4)'],                     popular: false },
  { id: 'highschool_only',   name: 'High School',   price: 10000, annual: 95000,  color: '#f59e0b', bg: '#fffbeb', levels: ['High School (Form 5-6)'],                   popular: false },
  { id: 'primary_secondary', name: 'Primary + Sec', price: 12000, annual: 110000, color: '#10b981', bg: '#ecfdf5', levels: ['Primary','Secondary'],                      popular: true  },
  { id: 'full_k12',          name: 'Full K-12',     price: 18000, annual: 170000, color: '#ef4444', bg: '#fef2f2', levels: ['Primary','Secondary','High School'],        popular: false },
  { id: 'postgraduate',      name: 'University',    price: 20000, annual: 190000, color: '#6366f1', bg: '#eef2ff', levels: ['Undergraduate','Masters'],                  popular: false },
];

const FEATURES = ['Unlimited HD video lessons','Zeal AI quiz after every lesson','Download resources & notes','Track your progress','NECTA-aligned curriculum','Watch on any device','7-day free trial included'];

export default function PricingPage() {
  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#fff', color: '#0a0a0a', minHeight: '100vh' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: G, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0a0a0a' }}>Skolr</span>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#0a0a0a', textDecoration: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8 }}>Log in</Link>
            <Link href="/register" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 700, color: '#fff', background: G, textDecoration: 'none', borderRadius: 8 }}>Start free trial</Link>
          </div>
        </div>
      </header>
      <div style={{ textAlign: 'center', padding: '56px 24px 40px', background: 'linear-gradient(180deg,#f9fafb,#fff)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: 999, padding: '5px 14px', marginBottom: 16 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={G}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>7-day free trial on all plans</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12 }}>Simple, transparent pricing</h1>
        <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 480, margin: '0 auto 8px' }}>Choose your education level. Cancel anytime. No hidden fees.</p>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>All prices in Tanzanian Shillings (TZS)</p>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ border: plan.popular ? '2px solid '+G : '1px solid #e5e7eb', borderRadius: 14, padding: 24, position: 'relative', background: '#fff' }}>
              {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>Most Popular</div>}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: plan.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                {plan.levels.map(l => <span key={l} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: plan.bg, color: plan.color }}>{l}</span>)}
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 900 }}>TZS {plan.price.toLocaleString()}</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>/month</span>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>or TZS {plan.annual.toLocaleString()}/year — save {Math.round((1-plan.annual/(plan.price*12))*100)}%</p>
              </div>
              <Link href="/register" style={{ display: 'block', padding: '11px', fontSize: 14, fontWeight: 700, color: plan.popular ? '#fff' : plan.color, background: plan.popular ? G : plan.bg, border: plan.popular ? 'none' : '1.5px solid '+plan.color+'44', borderRadius: 9, textDecoration: 'none', textAlign: 'center', marginBottom: 16 }}>Start free trial</Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={G}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)', borderRadius: 16, padding: '32px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Not sure which plan? Try free for 7 days</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>No credit card, no M-Pesa required.</p>
          </div>
          <Link href="/register" style={{ padding: '12px 28px', fontSize: 14, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}>Start for free</Link>
        </div>
      </div>
      <footer style={{ background: '#0a0a0a', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: G, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Skolr</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>2025 Skolr. All rights reserved. Made in Tanzania.</p>
      </footer>
      <style>{'@media(max-width:900px){div[style*="repeat(3,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:580px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}'}</style>
    </div>
  );
}
