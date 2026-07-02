import Link from 'next/link';
import { LAUNCH_NAV_ITEMS } from '@/lib/launchCatalog';

const G = '#10B981';

type Props = {
  userRole?: 'student' | 'instructor' | 'admin' | null;
};

export default function PublicTopNav({ userRole = null }: Props) {
  const dashboardHref = userRole === 'admin' ? '/admin' : userRole === 'instructor' ? '/instructor' : '/dashboard';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb' }}>
      <div className="public-top-nav-shell" style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, minHeight: 72, padding: '0 24px', flexWrap: 'wrap' }}>
        <Link href="/" className="public-top-nav-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0a0a0a', flexShrink: 0, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>Skolr</p>
            <p className="public-top-nav-brand-subtitle" style={{ fontSize: 11, color: '#5f6a64' }}>Master Form Four. Pass with Confidence.</p>
          </div>
        </Link>

        <nav className="public-top-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', minWidth: 0 }}>
          {LAUNCH_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="public-top-nav-link"
              style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#34423c', textDecoration: 'none', borderRadius: 999, whiteSpace: 'nowrap' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-top-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {userRole ? (
            <Link href={dashboardHref} className="public-top-nav-action" style={{ marginLeft: 8, padding: '10px 16px', fontSize: 14, fontWeight: 800, color: '#fff', background: '#121212', borderRadius: 999, textDecoration: 'none' }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="public-top-nav-action" style={{ marginLeft: 8, padding: '10px 16px', fontSize: 14, fontWeight: 800, color: '#111827', border: '1px solid #d9dee7', borderRadius: 999, textDecoration: 'none', background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)' }}>
              Log in
            </Link>
          )}
        </div>

        <style>{`
          @media (max-width: 860px) {
            .public-top-nav-shell {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }

            .public-top-nav-links {
              flex-wrap: wrap;
              justify-content: flex-end;
            }
          }

          @media (max-width: 640px) {
            .public-top-nav-shell {
              gap: 12px !important;
              align-items: flex-start !important;
              padding-top: 12px !important;
              padding-bottom: 12px !important;
              min-height: auto !important;
            }

            .public-top-nav-brand {
              width: 100%;
            }

            .public-top-nav-brand-subtitle {
              display: none !important;
            }

            .public-top-nav-links {
              order: 2;
              width: 100%;
              margin-left: 0 !important;
              gap: 8px !important;
              justify-content: flex-start;
              overflow-x: auto;
              flex-wrap: nowrap !important;
              padding-bottom: 6px;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
            }

            .public-top-nav-links::-webkit-scrollbar {
              display: none;
            }

            .public-top-nav-link {
              flex: 0 0 auto;
            }

            .public-top-nav-actions {
              order: 3;
              width: 100%;
              display: flex;
              gap: 10px !important;
            }

            .public-top-nav-action {
              flex: 1 1 0;
              min-width: 0;
              text-align: center;
              margin-left: 0 !important;
              white-space: nowrap;
              line-height: 1 !important;
              font-size: 12px !important;
              min-height: 42px !important;
            }

        `}</style>
      </div>
    </header>
  );
}
