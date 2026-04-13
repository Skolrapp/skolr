'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/ui/SearchBar';

const G = '#10B981';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const homeHref = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : '/dashboard';
  const initial  = user?.name?.charAt(0).toUpperCase() || '?';
  const hasPhoto = !!(user as any)?.avatar_url && !imgError;
  const roleLabel = user?.role === 'admin' ? 'Super Admin' : user?.role === 'instructor' ? 'Instructor' : 'Student';
  const stopImpersonation = async () => {
    await fetch('/api/admin/impersonation/stop', { method: 'POST', credentials: 'include' });
    window.location.href = '/admin';
  };
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!menuRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [menuOpen]);

  const menuItems = user?.role === 'admin'
    ? [
        { label: 'Control center', href: '/admin?tab=reviews' },
        { label: 'Scholar tracker', href: '/admin?tab=tracker' },
        { label: 'Course cloning', href: '/admin?tab=cloning' },
        { label: 'User support', href: '/admin?tab=support' },
        { label: 'Course catalog', href: '/courses' },
      ]
    : [
        { label: 'Home', href: homeHref },
        { label: 'Browse courses', href: '/courses' },
        { label: 'Subscription', href: '/settings' },
        ...(user?.role === 'instructor' ? [{ label: 'My courses', href: '/instructor' }] : []),
        { label: 'Edit profile', href: user?.role === 'instructor' ? '/instructors/' + user?.id : '/settings' },
      ];

  return (
    <>
    {user?.is_impersonating && (
      <div style={{ background: '#fbbf24', color: '#111827', padding: '8px 24px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Impersonation mode: you are viewing Skolr as this user.</span>
        <button onClick={stopImpersonation} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', minHeight: 0, minWidth: 0 }}>
          Exit impersonation
        </button>
      </div>
    )}
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="top-header-shell" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 60, padding: '0 24px' }}>
        <Link href={homeHref} className="top-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, background: G, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#0a0a0a' }}>Skolr</span>
        </Link>
        <div className="top-header-search" style={{ flex: 1, maxWidth: 440 }}>
          <SearchBar placeholder="Search courses, instructors..." />
        </div>
        <div className="top-header-spacer" style={{ flex: 1 }} />
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(m => !m)}
            style={{ width: 34, height: 34, borderRadius: '50%', background: hasPhoto ? 'transparent' : 'rgba(16,185,129,0.12)', border: '2px solid ' + (menuOpen ? G : '#e5e7eb'), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 0, minWidth: 0, overflow: 'hidden', padding: 0 }}>
            {hasPhoto ? (
              <img src={(user as any).avatar_url} alt={user?.name || ''} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 700, color: G }}>{initial}</span>
            )}
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 42, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '6px', minWidth: 190, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} onMouseLeave={() => setMenuOpen(false)}>
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: hasPhoto ? 'transparent' : '#ecfdf5', border: '1px solid #e5e7eb', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasPhoto ? <img src={(user as any).avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 14, fontWeight: 700, color: G }}>{initial}</span>}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{roleLabel}</p>
                </div>
              </div>
              {menuItems.map(item => (
                <button key={item.label} onClick={() => { router.push(item.href); setMenuOpen(false); }}
                  style={{ display: 'block', width: '100%', padding: '9px 12px', fontSize: 13, color: '#374151', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', textAlign: 'left', minHeight: 0, minWidth: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ display: 'block', width: '100%', padding: '9px 12px', fontSize: 13, color: '#ef4444', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', textAlign: 'left', minHeight: 0, minWidth: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    <style jsx>{`
      @media (max-width: 640px) {
        .top-header-shell {
          height: auto !important;
          padding: 10px 14px !important;
          gap: 10px !important;
          flex-wrap: wrap;
          align-items: center !important;
        }

        .top-header-brand {
          min-width: 0;
        }

        .top-header-search {
          order: 3;
          flex: 1 1 100% !important;
          max-width: none !important;
        }

        .top-header-spacer {
          display: none;
        }
      }
    `}</style>
    </>
  );
}
