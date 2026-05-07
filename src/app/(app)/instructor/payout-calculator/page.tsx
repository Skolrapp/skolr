'use client';

import Link from 'next/link';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import PayoutCalculator from '@/components/finance/PayoutCalculator';

export default function InstructorPayoutCalculatorPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0f0d' }}>
      <TopHeader />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: '#6ee7b7' }}>Instructor tools</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Payout calculator</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: '#94a3b8' }}>
              Model Skolr&apos;s revenue split and distribute the instructor pool fairly by watch-time contribution.
            </p>
          </div>
          <Link
            href="/instructor"
            className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors"
            style={{ borderColor: 'rgba(148,163,184,0.2)', color: '#e2e8f0', background: 'rgba(15,23,42,0.55)' }}
          >
            Back to dashboard
          </Link>
        </div>

        <PayoutCalculator />
      </main>
      <BottomNav />
    </div>
  );
}
