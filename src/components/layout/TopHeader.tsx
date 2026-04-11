'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/ui/SearchBar';

const G = '#10B981';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ background: '#111111', borderBottom: '1px solid #1f1f1f', padding: '0 16px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, height: 56 }}>
        <Link href={user?.role === 'instructor' ? '/instructor' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>Skolr</span>
        </Link>
        <div style={{ flex: 1, maxWidth: 480 }}>
          <SearchBar placeholder="Search courses, instructors..." />
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <Link href="/courses" style={{ padding: '6px 10px', fontSize: 13, fontWeight: 500, color: '#a3a3a3', textDecoration: 'none', borderRadius: 6 }}>Courses</Link>
          {user?.role === 'instructor' && <Link href="/instructor" style={{ padding: '6px 10px', fontSize: 13, fontWeight: 500, color: '#a3a3a3', textDecoration: 'none', borderRadius: 6 }}>Dashboard</Link>}
          {user?.role === 'student' && <Link href="/dashboard" style={{ padding: '6px 10px', fontSize: 13, fontWeight: 500, color: '#a3a3a3', textDecoration: 'none', borderRadius: 6 }}>Home</Link>}
        </nav>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(m => !m)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: `1.5px solid ${menuOpen ? G : 'rgba(16,185,129,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 0, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: G }}>{user?.name?.charAt(0).toUpperCase() || '?'}</span>
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 40, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '8px', minWidth: 180, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} onMouseLeave={() => setMenuOpen(false)}>
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #222' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: '#525252', marginTop: 2, textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
              {[{label:'Settings',href:'/settings'},{label:user?.role==='instructor'?'My Courses':'My Learning',href:user?.role==='instructor'?'/instructor':'/dashboard'}].map(item=>(
                <button key={item.label} onClick={()=>{router.push(item.href);setMenuOpen(false);}} style={{ display:'block',width:'100%',padding:'9px 12px',fontSize:13,color:'#e5e5e5',background:'transparent',border:'none',borderRadius:8,cursor:'pointer',textAlign:'left',minHeight:0,minWidth:0 }} onMouseEnter={e=>(e.currentTarget.style.background='#222')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{item.label}</button>
              ))}
              <button onClick={()=>{logout();setMenuOpen(false);}} style={{ display:'block',width:'100%',padding:'9px 12px',fontSize:13,color:'#ef4444',background:'transparent',border:'none',borderRadius:8,cursor:'pointer',textAlign:'left',marginTop:4,borderTop:'1px solid #222',minHeight:0,minWidth:0 }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.08)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
