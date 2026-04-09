'use client';
import { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';

const G = '#10B981';

function LoginContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const [pending, startTransition] = useTransition();
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [warn,     setWarn]     = useState('');

  useEffect(() => {
    if (params.get('reason') === 'session_ended') {
      setWarn('Your session was ended because you signed in on another device.');
    }
    if (params.get('registered')) setWarn('Account created! Sign in to continue.');
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { setError('Please enter your phone number and password.'); return; }
    setError('');

    startTransition(async () => {
      const fd = new FormData();
      fd.set('phone', phone);
      fd.set('password', password);
      const result = await loginAction(fd);
      if (!result) return; // redirect happened
      if ('error' in result) {
        setError(result.code === 'DEVICE_LIMIT_EXCEEDED'
          ? 'Device limit reached (max 2). Remove a device in Account → Devices.'
          : (result.error || 'Login failed. Please try again.'));
      } else if (result.success) {
        router.push(result.role === 'instructor' ? '/instructor' : '/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #111111 50%, #0d1a14 100%)' }}>
      {/* Subtle emerald glow top-left */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <svg className="w-8 h-8" style={{ color: G }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#fff' }}>Skolr</h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#737373' }}>Your HD Classroom</p>
          </div>

          {warn && (
            <div className="rounded-xl p-3 mb-5 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
              {warn}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="lbl">Phone number</label>
              <div className="flex gap-2">
                <span className="phone-prefix">+255</span>
                <input className="inp flex-1" type="tel" inputMode="tel" placeholder="712 345 678"
                  value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
              </div>
            </div>

            <div>
              <label className="lbl">Password</label>
              <input className="inp" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#525252' }}>
            New to Skolr?{' '}
            <Link href="/register" className="font-semibold !min-h-0 !min-w-0 inline" style={{ color: G }}>Create account</Link>
          </p>

          <p className="text-center text-xs mt-8" style={{ color: '#333333' }}>Tanzania · HD Education · All Levels</p>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() { return <Suspense fallback={null}><LoginContent /></Suspense>; }
