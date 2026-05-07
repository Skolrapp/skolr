'use client';

import { useMemo, useState } from 'react';

const G = '#10B981';

type TimeUnit = 'minutes' | 'hours';
type InstructorInput = {
  id: string;
  name: string;
  watchTime: string;
};

type ResultRow = {
  id: string;
  name: string;
  watchTime: number;
  watchShare: number;
  payout: number;
};

function createInstructor(index: number): InstructorInput {
  return {
    id: `instructor-${index + 1}`,
    name: '',
    watchTime: '',
  };
}

function formatTZS(value: number) {
  return `${Math.round(value).toLocaleString('en-TZ')} TZS`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function PayoutCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState('12000');
  const [skolrPercent, setSkolrPercent] = useState('40');
  const [instructorPercent, setInstructorPercent] = useState('60');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes');
  const [instructors, setInstructors] = useState<InstructorInput[]>([
    { id: 'instructor-1', name: 'Instructor A', watchTime: '240' },
    { id: 'instructor-2', name: 'Instructor B', watchTime: '120' },
    { id: 'instructor-3', name: 'Instructor C', watchTime: '60' },
    { id: 'instructor-4', name: 'Instructor D', watchTime: '60' },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const summary = useMemo(() => {
    const revenue = Number(monthlyRevenue);
    const skolrSharePercent = Number(skolrPercent);
    const instructorPoolPercent = Number(instructorPercent);
    const normalizedWatchTimes = instructors.map((instructor) => Number(instructor.watchTime));
    const totalWatchTime = normalizedWatchTimes.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    const skolrShare = revenue * (skolrSharePercent / 100);
    const instructorPool = revenue * (instructorPoolPercent / 100);

    const rows: ResultRow[] = instructors.map((instructor, index) => {
      const watchTime = normalizedWatchTimes[index] || 0;
      const watchShare = totalWatchTime > 0 ? watchTime / totalWatchTime : 0;
      return {
        id: instructor.id,
        name: instructor.name || `Instructor ${index + 1}`,
        watchTime,
        watchShare,
        payout: instructorPool * watchShare,
      };
    });

    return {
      totalRevenue: revenue,
      skolrShare,
      instructorPool,
      totalWatchTime,
      rows,
    };
  }, [monthlyRevenue, skolrPercent, instructorPercent, instructors]);

  const instructorCount = instructors.length;

  const validate = () => {
    const nextErrors: string[] = [];
    const revenue = Number(monthlyRevenue);
    const skolrSharePercent = Number(skolrPercent);
    const instructorPoolPercent = Number(instructorPercent);

    if (!Number.isFinite(revenue) || revenue <= 0) {
      nextErrors.push('Monthly subscription revenue must be greater than zero.');
    }

    if (!Number.isFinite(skolrSharePercent) || skolrSharePercent < 0 || skolrSharePercent > 100) {
      nextErrors.push('Skolr percentage must be between 0 and 100.');
    }

    if (!Number.isFinite(instructorPoolPercent) || instructorPoolPercent < 0 || instructorPoolPercent > 100) {
      nextErrors.push('Instructor percentage must be between 0 and 100.');
    }

    if (Math.abs((skolrSharePercent + instructorPoolPercent) - 100) > 0.001) {
      nextErrors.push('Skolr and instructor percentages must add up to 100%.');
    }

    instructors.forEach((instructor, index) => {
      if (!instructor.name.trim()) {
        nextErrors.push(`Instructor ${index + 1} name is required.`);
      }

      const watchTime = Number(instructor.watchTime);
      if (!Number.isFinite(watchTime) || watchTime < 0) {
        nextErrors.push(`Instructor ${index + 1} watch time must be a valid number.`);
      }
    });

    if (summary.totalWatchTime <= 0) {
      nextErrors.push('Total watch time must be greater than zero.');
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleInstructorCountChange = (value: string) => {
    const nextCount = Math.max(1, Math.min(50, Number(value) || 1));
    setInstructors((current) => {
      if (nextCount === current.length) return current;
      if (nextCount < current.length) return current.slice(0, nextCount);
      return [
        ...current,
        ...Array.from({ length: nextCount - current.length }, (_, index) => createInstructor(current.length + index)),
      ];
    });
  };

  const updateInstructor = (id: string, field: 'name' | 'watchTime', value: string) => {
    setInstructors((current) => current.map((instructor) => (
      instructor.id === id ? { ...instructor, [field]: value } : instructor
    )));
  };

  const handleCalculate = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    validate();
  };

  const handleReset = () => {
    setMonthlyRevenue('12000');
    setSkolrPercent('40');
    setInstructorPercent('60');
    setTimeUnit('minutes');
    setInstructors([
      { id: 'instructor-1', name: 'Instructor A', watchTime: '240' },
      { id: 'instructor-2', name: 'Instructor B', watchTime: '120' },
      { id: 'instructor-3', name: 'Instructor C', watchTime: '60' },
      { id: 'instructor-4', name: 'Instructor D', watchTime: '60' },
    ]);
    setErrors([]);
    setSubmitted(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section
        className="rounded-[28px] border p-5 shadow-2xl sm:p-6"
        style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9), rgba(2,6,23,0.96))', borderColor: 'rgba(148,163,184,0.14)' }}
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Calculator inputs</h2>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              Enter the monthly revenue split and each instructor&apos;s watch time.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors"
            style={{ borderColor: 'rgba(16,185,129,0.24)', color: '#6ee7b7', background: 'rgba(16,185,129,0.08)' }}
          >
            Reset
          </button>
        </div>

        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="lbl">Monthly subscription revenue (TZS)</label>
              <input className="inp" inputMode="decimal" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} placeholder="e.g. 12000" />
            </div>
            <div>
              <label className="lbl">Number of instructors</label>
              <input className="inp" type="number" min={1} max={50} value={instructorCount} onChange={(e) => handleInstructorCountChange(e.target.value)} />
            </div>
            <div>
              <label className="lbl">Skolr percentage</label>
              <input className="inp" inputMode="decimal" value={skolrPercent} onChange={(e) => setSkolrPercent(e.target.value)} placeholder="40" />
            </div>
            <div>
              <label className="lbl">Instructor percentage</label>
              <input className="inp" inputMode="decimal" value={instructorPercent} onChange={(e) => setInstructorPercent(e.target.value)} placeholder="60" />
            </div>
          </div>

          <div className="rounded-[24px] border p-4" style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(15,23,42,0.42)' }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Instructor watch time</h3>
                <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
                  Use one unit across the whole month for all instructors.
                </p>
              </div>
              <div className="inline-flex rounded-2xl border p-1" style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(2,6,23,0.55)' }}>
                {(['minutes', 'hours'] as TimeUnit[]).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTimeUnit(unit)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-colors"
                    style={timeUnit === unit ? { background: G, color: '#03120d' } : { color: '#cbd5e1' }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {instructors.map((instructor, index) => (
                <div
                  key={instructor.id}
                  className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[0.9fr_1.1fr]"
                  style={{ borderColor: 'rgba(148,163,184,0.12)', background: 'rgba(2,6,23,0.45)' }}
                >
                  <div>
                    <label className="lbl">Instructor name</label>
                    <input className="inp" value={instructor.name} onChange={(e) => updateInstructor(instructor.id, 'name', e.target.value)} placeholder={`Instructor ${index + 1}`} />
                  </div>
                  <div>
                    <label className="lbl">Watch time ({timeUnit})</label>
                    <input className="inp" inputMode="decimal" value={instructor.watchTime} onChange={(e) => updateInstructor(instructor.id, 'watchTime', e.target.value)} placeholder={timeUnit === 'minutes' ? 'e.g. 240' : 'e.g. 4'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errors.length > 0 && submitted && (
            <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'rgba(248,113,113,0.22)', background: 'rgba(127,29,29,0.26)', color: '#fecaca' }}>
              <p className="font-semibold">Please fix the following:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="btn-primary sm:w-auto sm:px-6">Calculate payouts</button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold transition-colors"
              style={{ borderColor: 'rgba(148,163,184,0.2)', color: '#e2e8f0', background: 'rgba(15,23,42,0.5)' }}
            >
              Reset form
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border p-5 shadow-2xl sm:p-6" style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.12), rgba(2,6,23,0.96))', borderColor: 'rgba(16,185,129,0.2)' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: '#6ee7b7' }}>Summary</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['Total revenue', formatTZS(summary.totalRevenue)],
              ['Skolr share', formatTZS(summary.skolrShare)],
              ['Instructor pool', formatTZS(summary.instructorPool)],
              ['Total watch time', `${summary.totalWatchTime.toLocaleString('en-TZ')} ${timeUnit}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border p-4" style={{ borderColor: 'rgba(148,163,184,0.12)', background: 'rgba(2,6,23,0.48)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{label}</p>
                <p className="mt-2 text-lg font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border p-5 shadow-2xl sm:p-6" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.96))', borderColor: 'rgba(148,163,184,0.14)' }}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Payout results</h2>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              Each instructor&apos;s share is based on their contribution to total watch time.
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: 'rgba(148,163,184,0.14)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead style={{ background: '#06110d' }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold" style={{ color: '#a7f3d0' }}>Instructor</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: '#a7f3d0' }}>Watch time</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: '#a7f3d0' }}>Watch share</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: '#a7f3d0' }}>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map((row, index) => (
                    <tr key={row.id} style={{ background: index % 2 === 0 ? 'rgba(15,23,42,0.82)' : 'rgba(2,6,23,0.94)', borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                      <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                      <td className="px-4 py-3" style={{ color: '#cbd5e1' }}>{row.watchTime.toLocaleString('en-TZ')} {timeUnit}</td>
                      <td className="px-4 py-3" style={{ color: '#cbd5e1' }}>{formatPercent(row.watchShare * 100)}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: '#6ee7b7' }}>{formatTZS(row.payout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'rgba(148,163,184,0.14)', background: 'rgba(15,23,42,0.56)', color: '#cbd5e1' }}>
            Formula used:
            <span className="ml-2 font-medium" style={{ color: '#f8fafc' }}>
              instructor payout = instructor pool × (instructor watch time ÷ total watch time)
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
