'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/actions/auth';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import { EDUCATION_LEVELS } from '@/lib/constants';
import type { EducationLevel } from '@/types';

const G = '#10B981';

export default function RegisterPage() {
  const router  = useRouter();
  const [pending, start] = useTransition();
  const [role,     setRole]     = useState<'student'|'instructor'>('student');
  const [learnerLevel, setLearnerLevel] = useState<EducationLevel>('primary');
  const [learnerSubCategory, setLearnerSubCategory] = useState('Std 1');
  const [form, setForm] = useState({
    accountName: '',
    learnerName: '',
    phone: '',
    password: '',
    confirm: '',
    guardianConsent: false,
  });
  const [error,    setError]    = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const selectedLevel = EDUCATION_LEVELS.find((entry) => entry.key === learnerLevel);
  const isMinorFlow = role === 'student' && ['primary', 'secondary', 'highschool'].includes(learnerLevel);
  const accountHeading = role === 'instructor'
    ? 'Instructor account'
    : isMinorFlow
      ? 'Parent or guardian account'
      : 'Adult learner account';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.accountName.trim()) { setError(role === 'instructor' ? 'Full name is required.' : isMinorFlow ? 'Parent or guardian full name is required.' : 'Learner full name is required.'); return; }
    if (!form.phone.trim())       { setError('Phone number is required.'); return; }
    if (role === 'student' && !form.learnerName.trim()) { setError('Learner full name is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (isMinorFlow && !form.guardianConsent) { setError('Parent or guardian consent is required for learners under 18.'); return; }
    if (turnstileEnabled && !turnstileToken) { setError('Please complete the security check.'); return; }

    start(async () => {
      const fd = new FormData();
      fd.set('name',     form.accountName);
      fd.set('phone',    form.phone);
      fd.set('password', form.password);
      fd.set('role',     role);
      if (role === 'student') {
        fd.set('learner_name', form.learnerName || form.accountName);
        fd.set('learner_level', learnerLevel);
        if (learnerSubCategory) fd.set('learner_sub_category', learnerSubCategory);
        if (form.guardianConsent) fd.set('guardian_consent', 'yes');
      }
      fd.set('turnstile_token', turnstileToken);
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
          <p className="text-sm mt-1" style={{ color: '#737373' }}>Join Skolr with your WhatsApp number</p>
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
          {role === 'student' && (
            <>
              <div>
                <label className="lbl">Learner stage</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {EDUCATION_LEVELS.map((level) => (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => {
                        setLearnerLevel(level.key);
                        setLearnerSubCategory(level.sub_categories[0] || '');
                      }}
                      className="p-3 rounded-xl border text-left !min-h-0 !min-w-0 transition-all"
                      style={learnerLevel === level.key
                        ? { border: `2px solid ${G}`, background: 'rgba(16,185,129,0.1)', color: '#fff' }
                        : { border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#a3a3a3' }}
                    >
                      <p className="text-sm font-semibold">{level.label}</p>
                      <p className="text-xs mt-1" style={{ color: learnerLevel === level.key ? '#a7f3d0' : '#737373' }}>{level.description}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: '#737373' }}>
                  {isMinorFlow
                    ? 'Learners up to Form 6 must be managed by a parent or guardian because they are minors.'
                    : 'Undergraduate and masters learners can create their own accounts directly.'}
                </p>
              </div>

              {selectedLevel?.sub_categories.length ? (
                <div>
                  <label className="lbl">Class / year</label>
                  <select
                    className="inp"
                    value={learnerSubCategory}
                    onChange={(e) => setLearnerSubCategory(e.target.value)}
                  >
                    {selectedLevel.sub_categories.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          )}

          <div className="rounded-2xl p-4" style={{ background: '#151515', border: '1px solid #222' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#fff' }}>{accountHeading}</p>
            <p className="text-xs" style={{ color: '#737373' }}>
              {role === 'instructor'
                ? 'Use your WhatsApp number as the main contact and login number.'
                : isMinorFlow
                  ? 'The parent or guardian owns the account, receives subscription notices, and manages the learner.'
                  : 'This account belongs directly to the learner and uses WhatsApp number for sign in and billing contact.'}
            </p>
          </div>

          <div>
            <label className="lbl">{role === 'instructor' ? 'Full name' : isMinorFlow ? 'Parent / guardian full name' : 'Learner full name'}</label>
            <input className="inp" type="text" placeholder={role === 'instructor' ? 'Your full name' : isMinorFlow ? 'Parent or guardian full name' : 'Learner full name'}
              value={form.accountName} onChange={e => setForm(f => ({...f, accountName: e.target.value}))} autoComplete="name" />
          </div>
          {role === 'student' && (
            <div>
              <label className="lbl">Learner full name</label>
              <input className="inp" type="text" placeholder="Learner full name"
                value={form.learnerName} onChange={e => setForm(f => ({...f, learnerName: e.target.value}))} autoComplete="name" />
            </div>
          )}
          <div>
            <label className="lbl">WhatsApp number</label>
            <div className="flex gap-2">
              <span className="phone-prefix">+255</span>
              <input className="inp flex-1" type="tel" inputMode="tel" placeholder="712 345 678"
                value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} autoComplete="tel" />
            </div>
            <p className="text-xs mt-2" style={{ color: '#737373' }}>
              This WhatsApp number will be used for sign in and parent communication.
            </p>
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
          {role === 'student' && isMinorFlow && (
            <label className="flex items-start gap-3 rounded-xl p-3" style={{ background: '#151515', border: '1px solid #222' }}>
              <input
                type="checkbox"
                checked={form.guardianConsent}
                onChange={(e) => setForm((f) => ({ ...f, guardianConsent: e.target.checked }))}
                style={{ marginTop: 2 }}
              />
              <span className="text-sm" style={{ color: '#a3a3a3' }}>
                I confirm that I am the parent or legal guardian of this learner and I consent to creating and managing this account.
              </span>
            </label>
          )}

          {turnstileEnabled && (
            <TurnstileWidget
              onTokenChange={(token) => {
                setTurnstileToken(token);
                if (token) setError('');
              }}
              onExpire={() => setTurnstileToken('')}
            />
          )}

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Creating...</span> : role === 'student' && isMinorFlow ? 'Create parent account' : 'Create account'}
          </button>
          <p className="text-xs text-center" style={{ color: '#525252' }}>
            By creating an account you agree to our Terms of Service and, for minors, confirm guardian consent.
          </p>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: '#525252' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold !min-h-0 !min-w-0 inline" style={{ color: G }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
