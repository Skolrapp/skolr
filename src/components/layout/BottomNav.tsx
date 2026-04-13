'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types';

const G = '#10B981';

const studentNav = [
  { href: '/dashboard', label: 'Home',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/courses', label: 'Courses',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
  { href: '/settings', label: 'Account',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
];

const instructorNav = [
  { href: '/instructor', label: 'Earnings',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { href: '/instructor/upload', label: 'Upload',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
  { href: '/courses', label: 'Browse',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
  { href: '/settings', label: 'Account',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
];

const adminNav = [
  { href: '/admin?tab=reviews', tab: 'reviews', label: 'Review',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { href: '/admin?tab=tracker', tab: 'tracker', label: 'Tracker',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 4-6"/></svg> },
  { href: '/admin?tab=cloning', tab: 'cloning', label: 'Cloning',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/></svg> },
  { href: '/admin?tab=support', tab: 'support', label: 'Support',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0v1H4v4h2v3a2 2 0 002 2h3"/><path d="M13 19h4"/></svg> },
];

type AdminTab = typeof adminNav[number]['tab'];

export default function BottomNav({ role = 'student', adminTab }: { role?: UserRole; adminTab?: AdminTab }) {
  const pathname = usePathname();
  const nav = role === 'instructor' ? instructorNav : studentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav">
      <div className="max-w-2xl mx-auto flex">
        {role === 'admin' ? adminNav.map(item => {
          const active = pathname === '/admin' && item.tab === adminTab;
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors"
              style={{ color: active ? G : '#525252' }}>
              <span style={{ transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s', color: active ? G : '#525252' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        }) : nav.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors"
              style={{ color: active ? G : '#525252' }}>
              <span style={{ transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s', color: active ? G : '#525252' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
