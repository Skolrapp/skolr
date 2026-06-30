'use client';
import Link from 'next/link';
const G = '#10B981';
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 672, margin: '0 auto', padding: '32px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div><p style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Skolr</p><p style={{ fontSize: 11, color: '#525252', marginTop: 2 }}>Master Form Four. Pass with Confidence.</p></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 16px', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#525252', textTransform: 'uppercase', marginBottom: 10 }}>Launch focus</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{href:'/courses?level=secondary&sub=Form%204',label:'Form Four Subjects'},{href:'/pricing',label:'15,000 TZS Monthly Access'},{href:'/register',label:'Try Skolr Free'},{href:'/login',label:'Student Login'}].map(l=>(
                <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#a3a3a3', textDecoration: 'none' }}>{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#525252', textTransform: 'uppercase', marginBottom: 10 }}>Skolr</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{href:'/dashboard',label:'Form Four Dashboard'},{href:'/courses?level=secondary&sub=Form%204',label:'Course Catalog'},{href:'/privacy',label:'Privacy'},{href:'/contact',label:'Contact'}].map(l=>(
                <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#a3a3a3', textDecoration: 'none' }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: '#1a1a1a', marginBottom: 20 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#333' }}>© {year} Skolr. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['Privacy','/privacy'],['Terms','/terms'],['Contact','/contact']].map(([label,href])=>(
              <Link key={label} href={href} style={{ fontSize: 12, color: '#333', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
