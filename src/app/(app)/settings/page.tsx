'use client';
import { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import { SUBSCRIPTION_BUNDLES } from '@/lib/subscriptions';
import { MOBILE_MONEY_PROVIDERS, BILLING_CYCLES } from '@/lib/constants';
import { startFreeTrialAction } from '@/actions/trial';
import type { Device, SubscriptionTier, PaymentProvider, BillingCycle } from '@/types';

const G = '#10B981';
type Tab = 'plans' | 'devices' | 'account';

function SettingsContent() {
  const sp = useSearchParams();
  const { user, logout, refetch } = useAuth();
  const [tab,      setTab]      = useState<Tab>((sp.get('tab') as Tab) || 'plans');
  const [tier,     setTier]     = useState<SubscriptionTier>('primary_secondary');
  const [cycle,    setCycle]    = useState<BillingCycle>('monthly');
  const [provider, setProvider] = useState<PaymentProvider>('mpesa');
  const [msisdn,   setMsisdn]   = useState('');
  const [paying,   setPaying]   = useState(false);
  const [payMsg,   setPayMsg]   = useState<{ ok: boolean; msg: string } | null>(null);
  const [devices,  setDevices]  = useState<Device[]>([]);
  const [devLoad,  setDevLoad]  = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [trialMsg, setTrialMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (tab === 'devices') {
      setDevLoad(true);
      fetch('/api/devices', { credentials: 'include' })
        .then(r => r.json())
        .then(d => { if (d.success) setDevices(d.data); })
        .finally(() => setDevLoad(false));
    }
  }, [tab]);

  const selectedBundle = SUBSCRIPTION_BUNDLES.find(b => b.id === tier)!;
  const amount = cycle === 'annual' ? selectedBundle?.price_annual : selectedBundle?.price_monthly;

  const pay = async () => {
    if (!msisdn.trim()) { setPayMsg({ ok: false, msg: 'Enter your mobile money number.' }); return; }
    setPaying(true); setPayMsg(null);
    const res  = await fetch('/api/payments/initiate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ tier, cycle, provider, msisdn }),
    });
    const data = await res.json();
    setPaying(false);
    setPayMsg({ ok: data.success, msg: data.data?.message || data.error || 'Unknown error' });
    if (data.success) refetch();
  };

  const [trialPending, startTrialTransition] = useTransition();

  const startTrial = () => {
    startTrialTransition(async () => {
      setTrialMsg(null);
      const result = await startFreeTrialAction(tier);
      if ('error' in result && result.error) {
        setTrialMsg({ ok: false, msg: result.error });
      } else if ('success' in result && result.success) {
        setTrialMsg({ ok: true, msg: result.message! });
        refetch();
      }
    });
  };

  const removeDevice = async (id: string) => {
    setRemoving(id);
    const res  = await fetch('/api/devices', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ deviceId: id }) });
    const data = await res.json();
    if (data.success) setDevices((d: Device[]) => d.filter((x: Device) => x.id !== id));
    setRemoving(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="page">

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold" style={{ color: '#fff' }}>Account</h1>
          <button className="btn-ghost text-xs !min-w-0 px-2" style={{ color: '#ef4444' }} onClick={logout}>Sign out</button>
        </div>

        {/* Tabs */}
        <div className="tab-bar mb-5">
          {(['plans','devices','account'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`tab-item ${tab === t ? 'on' : ''}`}>
              {t === 'plans' ? 'Subscription' : t}
            </button>
          ))}
        </div>

        {/* ── PLANS ── */}
        {tab === 'plans' && (
          <div className="space-y-5 animate-fade-in">

            {/* Free trial banner — only shown to free-tier users */}
            {user.subscription_tier === 'free' && (
              <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.2)' }}>
                    <svg className="w-4 h-4" style={{ color: G }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-bold" style={{ color: G }}>7-Day Free Trial</p>
                  <span className="badge text-xs ml-auto" style={{ background: 'rgba(16,185,129,0.15)', color: G }}>No payment needed</span>
                </div>
                <p className="text-xs mb-4" style={{ color: '#a3a3a3' }}>
                  Pick a bundle below, then tap Start free trial — instant access for 7 days. No M-Pesa, no card required.
                </p>
                {trialMsg && (
                  <div className="rounded-xl p-3 text-sm mb-3" style={trialMsg.ok
                    ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
                    : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    {trialMsg.msg}
                  </div>
                )}
                <button onClick={startTrial} disabled={trialPending} className="btn-primary text-sm py-2.5">
                  {trialPending
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Activating...</span>
                    : `Start free trial — ${selectedBundle?.name}`}
                </button>
                <p className="text-xs text-center mt-2" style={{ color: '#525252' }}>
                  One trial per account. No charge — ever — unless you subscribe.
                </p>
              </div>
            )}

            <div>
              <h2 className="sec-head">Choose your bundle</h2>
              <div className="space-y-2">
                {SUBSCRIPTION_BUNDLES.map(b => (
                  <button key={b.id} onClick={() => setTier(b.id as SubscriptionTier)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border text-left !min-h-0 !min-w-0 transition-all"
                    style={tier === b.id
                      ? { border: `2px solid ${b.color}`, background: `${b.color}10` }
                      : { border: '1px solid #222', background: '#1a1a1a' }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: tier === b.id ? b.color : '#fff' }}>{b.name}</p>
                        {b.badge && <span className="badge text-xs" style={{ background: `${b.color}20`, color: b.color }}>{b.badge}</span>}
                        {b.popular && <span className="badge badge-green text-xs">Popular</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{b.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: tier === b.id ? b.color : '#fff' }}>
                        TZS {(cycle === 'annual' ? b.price_annual : b.price_monthly).toLocaleString()}
                      </p>
                      <p className="text-xs" style={{ color: '#525252' }}>/{cycle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing cycle */}
            <div>
              <h2 className="sec-head">Billing cycle</h2>
              <div className="grid grid-cols-2 gap-2">
                {BILLING_CYCLES.map(c => (
                  <button key={c.id} onClick={() => setCycle(c.id)}
                    className="p-3 rounded-xl border text-center !min-h-0 !min-w-0 transition-all"
                    style={cycle === c.id
                      ? { border: `2px solid ${G}`, background: 'rgba(16,185,129,0.1)', color: G, fontWeight: 700 }
                      : { border: '1px solid #222', background: '#1a1a1a', color: '#a3a3a3' }}>
                    <p className="text-sm font-semibold">{c.label}</p>
                    {c.discount && <p className="text-xs mt-0.5" style={{ color: G }}>{c.discount}</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div>
              <h2 className="sec-head">Pay with Mobile Money</h2>
              <div className="space-y-2">
                {MOBILE_MONEY_PROVIDERS.map(p => (
                  <button key={p.id} onClick={() => setProvider(p.id as PaymentProvider)}
                    className={`sel-card ${provider === p.id ? 'on' : ''}`}
                    style={provider === p.id ? { borderColor: p.color, background: p.bg } : {}}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.bg }}>
                      <svg className="w-4 h-4" style={{ color: p.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: '#fff' }}>{p.label}</p>
                      <p className="text-xs" style={{ color: '#737373' }}>{p.network}</p>
                    </div>
                    {provider === p.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: p.color }}>
                        <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="lbl">Mobile money number</label>
              <div className="flex gap-2">
                <span className="phone-prefix">+255</span>
                <input className="inp flex-1" type="tel" inputMode="tel" placeholder="712 345 678"
                  value={msisdn} onChange={e => setMsisdn(e.target.value)} />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div>
                <p className="text-xs" style={{ color: '#737373' }}>Total due · {selectedBundle?.name}</p>
                <p className="text-xs" style={{ color: '#525252' }}>{cycle === 'annual' ? '12 months' : '1 month'}</p>
              </div>
              <p className="text-lg font-bold" style={{ color: G }}>TZS {(amount || 0).toLocaleString()}</p>
            </div>

            {payMsg && (
              <div className="rounded-xl p-3 text-sm" style={payMsg.ok
                ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
                : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {payMsg.msg}
              </div>
            )}

            <button className="btn-primary" onClick={pay} disabled={paying}>
              {paying
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/>Processing...</span>
                : `Subscribe with ${MOBILE_MONEY_PROVIDERS.find(p => p.id === provider)?.label}`}
            </button>
            <p className="text-xs text-center" style={{ color: '#525252' }}>
              A USSD prompt will be sent to your phone. Enter your PIN to confirm payment.
            </p>
          </div>
        )}

        {/* ── DEVICES ── */}
        {tab === 'devices' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="sec-head mb-0">Registered devices</h2>
              <span className="badge text-xs" style={devices.length >= 2 ? { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' } : { background: 'rgba(16,185,129,0.15)', color: G }}>
                {devices.length} / 2
              </span>
            </div>
            <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}>
              <strong>Single-session rule:</strong> Signing in on a new device automatically ends all other sessions.
            </div>
            {devLoad ? (
              <div className="space-y-2">{[1,2].map(i=><div key={i} className="skel h-16 rounded-2xl"/>)}</div>
            ) : (
              <div className="space-y-2">
                {devices.length === 0
                  ? <p className="text-sm text-center py-8" style={{ color: '#525252' }}>No devices registered.</p>
                  : devices.map(d => (
                    <div key={d.id} className="card flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#222' }}>
                        <svg className="w-5 h-5" style={{ color: '#525252' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: '#fff' }}>{d.device_name}</p>
                          {d.is_current && <span className="badge badge-green text-xs flex-shrink-0">Current</span>}
                        </div>
                        <p className="text-xs" style={{ color: '#525252' }}>
                          Last active: {new Date(d.last_active).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {!d.is_current && (
                        <button className="btn-danger !min-h-0 px-3 py-1.5" onClick={() => removeDevice(d.id)} disabled={removing === d.id}>
                          {removing === d.id ? '...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {tab === 'account' && (
          <div className="space-y-4 animate-fade-in">
            <div className="card flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)', color: G }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#fff' }}>{user.name}</p>
                <p className="text-xs" style={{ color: '#737373' }}>{user.phone}</p>
                <span className="badge text-xs mt-1" style={user.role === 'instructor'
                  ? { background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }
                  : { background: 'rgba(16,185,129,0.15)', color: G }}>
                  {user.role}
                </span>
              </div>
            </div>
            {['Change password', 'Notifications', 'Privacy policy', 'Terms of service'].map(item => (
              <button key={item} className="card w-full flex items-center justify-between !min-h-0 text-left">
                <span className="text-sm" style={{ color: '#e5e5e5' }}>{item}</span>
                <svg className="w-4 h-4" style={{ color: '#333' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
            <button className="w-full py-3 rounded-xl text-sm font-semibold !min-h-0"
              style={{ border: '1px solid #3f1212', color: '#ef4444' }} onClick={logout}>
              Sign out of Skolr
            </button>
          </div>
        )}
      </div>
      <BottomNav role={user.role} />
    </div>
  );
}
export default function SettingsPage() { return <Suspense fallback={null}><SettingsContent /></Suspense>; }
