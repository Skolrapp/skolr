'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/actions/auth';

const G = '#10B981';

export default function RegisterPage() {
  const router  = useRouter();
  const [pending, start] = useTransition();
  const [role,     setRole]     = useState<'student'|'instructor'>('student');
  const [form,     setForm]     = useState({ name: '', phone: '', password: '', confirm: '' });
  const [error,    setError]    = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())        { setError('Full name is required.'); return; }
    if (!form.phone.trim())       { setError('Phone number is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    start(async () => {
      const fd = new FormData();
      fd.set('name',     form.name);
      fd.set('phone',    form.phone);
      fd.set('password', form.password);
      fd.set('role',     role);
      const result = await registerAction(fd);
      if (result?.error) { setError(result.error); }
      else { router.push('/login?registered=1'); }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #111111 50%, #0d1a14 100%)' }}>
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <svg className="w-7 h-7" style={{ color: G }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: '#737373' }}>Join Skolr today</p>
        </div>

        {/* Role selector */}
        <div className="mb-5">
          <p className="lbl mb-2">I am a</p>
          <div className="grid grid-cols-2 gap-2">
            {(['student', 'instructor'] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className="p-3 rounded-xl border text-center !min-h-0 !min-w-0 transition-all capitalize"
                style={role === r
                  ? { border: `2px solid ${G}`, background: 'rgba(16,185,129,0.1)', color: G, fontWeight: 700 }
                  : { border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#a3a3a3' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="lbl">Full name</label>
            <input className="inp" type="text" placeholder="Your full name"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} autoComplete="name" />
          </div>
          <div>
            <label className="lbl">Phone number</label>
            <div className="flex gap-2">
              <span className="phone-prefix">+255</span>
              <input className="inp flex-1" type="tel" inputMode="tel" placeholder="712 345 678"
                value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} autoComplete="tel" />
            </div>
          </div>
          <div>
            <label className="lbl">Password</label>
            <input className="inp" type="password" placeholder="At least 6 characters"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} autoComplete="new-password" />
          </div>
          <div>
            <label className="lbl">Confirm password</label>
            <input className="inp" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))} autoComplete="new-password" />
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Creating...</span> : 'Create account'}
          </button>
          <p className="text-xs text-center" style={{ color: '#525252' }}>By creating an account you agree to our Terms of Service.</p>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: '#525252' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold !min-h-0 !min-w-0 inline" style={{ color: G }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
