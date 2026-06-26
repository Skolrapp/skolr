'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FORM_FOUR_CLASS,
  FORM_FOUR_PRICE_TZS,
  FORM_FOUR_SUBJECTS,
  LAUNCH_NAV_ITEMS,
} from '../../lib/launchCatalog';
import type { Course } from '@/types';

const HERO_BG = '#27363c';
const TEAL = '#04959d';
const GREEN = '#24d366';
const LIGHT_BG = '#f6f7f9';
const LANDING_COURSES_CACHE_KEY = 'skolr:landing:courses';
const LANDING_BRANDING_CACHE_KEY = 'skolr:landing:branding';
let landingCoursesCache: Course[] | null = null;
let landingBrandingCache: Record<string, string | null> | null = null;

type LandingClientProps = {
  initialCourses: Course[];
  initialBanners: Record<string, string | null>;
};

const TRUST_POINTS = [
  'Structured learning paths',
  'Qualified instructors',
  'Exam-focused teaching',
  'Progress tracking',
] as const;

const BENEFIT_CARDS = [
  {
    title: 'Structured learning paths',
    copy: 'Move topic by topic in an academic flow that feels ordered and manageable.',
    icon: 'path',
  },
  {
    title: 'Qualified instructors',
    copy: 'Learn from calm, subject-focused teachers who explain with seriousness and clarity.',
    icon: 'user',
  },
  {
    title: 'Exam-focused teaching',
    copy: 'Every lesson is shaped to prepare students for real Form Four exam performance.',
    icon: 'target',
  },
  {
    title: 'Progress tracking',
    copy: 'Parents and students can see consistency build over time instead of guessing.',
    icon: 'chart',
  },
] as const;

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose a subject', copy: 'Start with the Form Four subject that needs the most attention right now.' },
  { step: '02', title: 'Learn with clear lessons', copy: 'Follow focused explanations built to reduce confusion and build confidence.' },
  { step: '03', title: 'Practice for exams', copy: 'Use revision guidance and mock-focused study to prepare with purpose.' },
] as const;

const STUDY_PARTNER_POINTS = [
  'Short post-lesson check-ins that feel supportive, not distracting.',
  'Instant feedback that helps students spot what actually landed.',
  'A calmer revision rhythm between lessons, quizzes, and exam prep.',
] as const;

const REASSURANCE_BANNERS = [
  {
    eyebrow: 'For Families',
    title: 'Personalised paths for every Form 4 student',
    copy: 'Give each learner a clearer route through lessons, revision, and exam preparation without losing momentum.',
    href: '#free-trial',
    cta: 'Start learning today',
  },
  {
    eyebrow: 'For Students',
    title: 'Real-time updates that put parents at ease',
    copy: 'Parents can stay informed with progress visibility that feels reassuring, supportive, and easy to follow.',
    href: '#subjects',
    cta: 'Learn More',
  },
] as const;

const PARENT_ASSURANCE = [
  'Students move through a clear sequence instead of jumping between disconnected videos.',
  'Parents can trust that Skolr is serious, academic, and built around exam readiness.',
  'Lessons are designed to help consistency grow week by week, not only before exams.',
] as const;

const SUCCESS_STORIES = [
  {
    name: 'Amina, Form Four student',
    quote: 'The lessons break topics down clearly. I stopped feeling lost and started revising with confidence.',
  },
  {
    name: 'Mr. Joseph, parent',
    quote: 'Skolr feels structured and reliable. It gives me confidence that revision time is being used well.',
  },
] as const;

function getTeachers(courses: Course[]) {
  const grouped = new Map<string, { name: string; subject: string; courseCount: number }>();

  courses.forEach((course) => {
    const name = course.instructor_name || 'Skolr instructor';
    const current = grouped.get(name);
    if (current) {
      current.courseCount += 1;
      return;
    }
    grouped.set(name, {
      name,
      subject: course.subject,
      courseCount: 1,
    });
  });

  return Array.from(grouped.values()).slice(0, 3);
}

export default function LandingClient({ initialCourses, initialBanners }: LandingClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(landingCoursesCache || initialCourses);
  const [banners, setBanners] = useState<Record<string, string | null>>(landingBrandingCache || initialBanners);

  useEffect(() => {
    let shouldFetchCourses = initialCourses.length === 0;
    let shouldFetchBranding = Object.keys(initialBanners).length === 0;

    if (typeof window !== 'undefined') {
      if (!landingCoursesCache && initialCourses.length > 0) {
        landingCoursesCache = initialCourses;
        window.sessionStorage.setItem(LANDING_COURSES_CACHE_KEY, JSON.stringify(initialCourses));
        shouldFetchCourses = false;
      }

      if (!landingBrandingCache && Object.keys(initialBanners).length > 0) {
        landingBrandingCache = initialBanners;
        window.sessionStorage.setItem(LANDING_BRANDING_CACHE_KEY, JSON.stringify(initialBanners));
        shouldFetchBranding = false;
      }

      if (!landingCoursesCache) {
        const cachedCourses = window.sessionStorage.getItem(LANDING_COURSES_CACHE_KEY);
        if (cachedCourses) {
          try {
            const parsed = JSON.parse(cachedCourses) as Course[];
            landingCoursesCache = parsed;
            setCourses(parsed);
            shouldFetchCourses = false;
          } catch {}
        }
      } else {
        shouldFetchCourses = false;
      }

      if (!landingBrandingCache) {
        const cachedBranding = window.sessionStorage.getItem(LANDING_BRANDING_CACHE_KEY);
        if (cachedBranding) {
          try {
            const parsed = JSON.parse(cachedBranding) as Record<string, string | null>;
            landingBrandingCache = parsed;
            setBanners(parsed);
            shouldFetchBranding = false;
          } catch {}
        }
      } else {
        shouldFetchBranding = false;
      }
    }

    const pendingRequests: Array<Promise<unknown>> = [];
    if (shouldFetchCourses) pendingRequests.push(fetch('/api/courses?level=secondary&sub=Form%204&per_page=7').then((r) => r.json()));
    if (shouldFetchBranding) pendingRequests.push(fetch('/api/site/branding').then((r) => r.json()));
    if (!pendingRequests.length) return;

    Promise.allSettled(pendingRequests).then((results) => {
      const coursesResult = shouldFetchCourses ? results.shift() : null;
      const brandingResult = shouldFetchBranding ? results.shift() : null;

      if (coursesResult && coursesResult.status === 'fulfilled' && (coursesResult.value as { success?: boolean }).success) {
        const nextCourses = ((coursesResult.value as { data?: { items?: Course[] } }).data?.items || []).filter(
          (course) => course.category === FORM_FOUR_CLASS.level && course.sub_category === FORM_FOUR_CLASS.subCategory
        );
        landingCoursesCache = nextCourses;
        setCourses(nextCourses);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(LANDING_COURSES_CACHE_KEY, JSON.stringify(nextCourses));
        }
      }

      if (brandingResult && brandingResult.status === 'fulfilled' && (brandingResult.value as { success?: boolean }).success) {
        const nextBanners = (brandingResult.value as { data?: { banners?: Record<string, string | null> } }).data?.banners || {};
        landingBrandingCache = nextBanners;
        setBanners(nextBanners);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(LANDING_BRANDING_CACHE_KEY, JSON.stringify(nextBanners));
        }
      }
    });
  }, [initialBanners, initialCourses]);

  const teachers = getTeachers(courses);

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#fcfcfa', color: '#121212' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(252,252,250,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #ecece7' }}>
        <div className="launch-shell launch-header" style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, minHeight: 74, padding: '0 24px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#121212', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>Skolr</p>
              <p style={{ fontSize: 11, color: '#5f6a64' }}>Master Form Four. Pass with Confidence.</p>
            </div>
          </Link>

          <nav className="launch-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            {LAUNCH_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#34423c', textDecoration: 'none', borderRadius: 999 }}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" style={{ marginLeft: 8, padding: '10px 16px', fontSize: 14, fontWeight: 800, color: '#fff', background: '#121212', borderRadius: 999, textDecoration: 'none' }}>
              Login
            </Link>
          </nav>

          <button
            type="button"
            className="launch-mobile-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open navigation"
            style={{ marginLeft: 'auto', display: 'none', border: '1px solid #d9ddd9', borderRadius: 10, background: '#fff', width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2">
              {menuOpen ? <><path d="M18 6 6 18" /><path d="M6 6l12 12" /></> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="launch-mobile-drawer" style={{ borderTop: '1px solid #ecece7', background: '#fcfcfa', padding: '14px 24px 22px' }}>
            <div style={{ display: 'grid', gap: 8 }}>
              {LAUNCH_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ padding: '12px 14px', borderRadius: 14, textDecoration: 'none', color: '#1f2937', background: '#fff', border: '1px solid #ecece7', fontSize: 14, fontWeight: 700 }}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ padding: '12px 14px', borderRadius: 14, textDecoration: 'none', color: '#fff', background: '#121212', fontSize: 14, fontWeight: 800, textAlign: 'center' }}>
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <section style={{ background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto', padding: '70px 24px 34px', position: 'relative' }}>
          <div
            className="launch-hero-banner"
            style={{
              position: 'relative',
              minHeight: 620,
              overflow: 'hidden',
              borderRadius: 32,
              background: banners['hero-banner']
                ? `url(${banners['hero-banner']}) center/cover no-repeat`
                : `linear-gradient(135deg,${HERO_BG} 0%,#1f2a2f 58%,#31454d 100%)`,
              boxShadow: '0 32px 80px rgba(8,14,14,0.14)',
              border: '1px solid rgba(4,149,157,0.12)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,20,24,0.58) 0%, rgba(7,20,24,0.34) 46%, rgba(7,20,24,0.1) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }} />
            <div className="launch-hero-content" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', minHeight: 620, padding: '54px 54px 50px' }}>
              <div style={{ maxWidth: 680, display: 'grid', gap: 18 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'rgba(4,149,157,0.12)', border: '1px solid rgba(4,149,157,0.2)', color: '#d9ffff', fontSize: 12, fontWeight: 800, width: 'fit-content' }}>
                  Form Four launch focus
                </div>
                <h1 style={{ fontSize: 58, lineHeight: 1.02, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', marginBottom: 0 }}>
                  Master Form Four. Pass with Confidence.
                </h1>
                <p style={{ maxWidth: 620, fontSize: 18, lineHeight: 1.8, color: 'rgba(255,255,255,0.82)', marginBottom: 0 }}>
                  Skolr empowers Form 4 students with personalised learning paths, crystal-clear explanations and progress updates that give parents confidence and assurance.
                </p>
                <div className="launch-hero-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 2 }}>
                  <Link href="/register" style={{ minHeight: 54, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', borderRadius: 16, background: GREEN, color: '#fff', fontSize: 14, fontWeight: 900, textDecoration: 'none', letterSpacing: 0.2, boxShadow: '0 18px 40px rgba(36,211,102,0.18)' }}>
                    Start for Free
                  </Link>
                </div>
                <div className="launch-hero-meta" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                    7 visible Form Four subjects
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                    {FORM_FOUR_PRICE_TZS.toLocaleString()} TZS monthly access
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <div className="launch-parent-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,0.42fr) minmax(0,1fr)', gap: 22, alignItems: 'center', borderRadius: 26, background: '#f4f7f8', border: '1px solid rgba(255,255,255,0.16)', padding: 24, boxShadow: '0 24px 60px rgba(7,14,15,0.14)' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 10 }}>Parent Trust</p>
                <h3 style={{ fontSize: 26, lineHeight: 1.2, fontWeight: 900, color: '#172126', marginBottom: 8 }}>Built to feel serious, structured, and visible.</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#51606a' }}>
                  A calmer learning environment for students, and clearer academic signals for parents.
                </p>
              </div>
              <div className="launch-parent-points" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
                {[
                  'Lessons follow a serious academic flow.',
                  'Students build confidence with clear explanations.',
                  'Progress habits and consistency stay visible over time.',
                ].map((item) => (
                  <div key={item} style={{ borderRadius: 18, background: '#fff', padding: 16, boxShadow: '0 10px 26px rgba(18,18,18,0.05)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 999, background: 'rgba(36,211,102,0.14)', color: '#0a7b3b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, lineHeight: 1.6, color: '#334249' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '36px 24px 34px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-section-head" style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Why families choose Skolr</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Support for Every Student.</h2>
              <p style={{ maxWidth: 700, fontSize: 15, lineHeight: 1.75, color: '#5a645f' }}>
                Skolr is designed to feel serious, calm, and academically grounded from the first lesson onward.
              </p>
            </div>
          </div>
          <div className="launch-benefit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
            {BENEFIT_CARDS.map((point) => (
              <div key={point.title} style={{ borderRadius: 22, border: '1px solid #e6e8e3', background: '#fff', padding: 20, boxShadow: '0 12px 28px rgba(18,18,18,0.04)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: '#e9fbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {point.icon === 'path' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><path d="M4 18c4 0 4-12 8-12s4 12 8 12" /><path d="M4 18h3" /><path d="M17 18h3" /></svg>}
                  {point.icon === 'user' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>}
                  {point.icon === 'target' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 2v3" /></svg>}
                  {point.icon === 'chart' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><path d="M4 19h16" /><path d="M7 16v-4" /><path d="M12 16V8" /><path d="M17 16v-6" /></svg>}
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 800, color: '#121212', marginBottom: 8 }}>{point.title}</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5b666f' }}>{point.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 34px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 22, border: '1px solid #dfe6e3', background: '#fff', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', boxShadow: '0 12px 28px rgba(18,18,18,0.04)' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>{REASSURANCE_BANNERS[0].eyebrow}</p>
              <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 900, color: '#121212', marginBottom: 4 }}>{REASSURANCE_BANNERS[0].title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5a645f' }}>{REASSURANCE_BANNERS[0].copy}</p>
            </div>
            <Link href={REASSURANCE_BANNERS[0].href} style={{ fontSize: 13, fontWeight: 800, color: '#047857', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {REASSURANCE_BANNERS[0].cta}
            </Link>
          </div>
        </div>
      </section>

      <section id="subjects" style={{ padding: '34px 24px 70px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-section-head" style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Form Four subjects</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Progress You Can Trust.</h2>
              <p style={{ maxWidth: 700, fontSize: 15, lineHeight: 1.75, color: '#5a645f' }}>
                Every public subject on Skolr right now is focused on Form Four exam preparation and confidence building.
              </p>
            </div>
            <Link href="/courses?level=secondary&sub=Form%204" style={{ fontSize: 13, fontWeight: 800, color: '#047857', textDecoration: 'none' }}>
              View all Form Four subjects
            </Link>
          </div>

          <div className="launch-subject-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
            {FORM_FOUR_SUBJECTS.map((subject) => {
              const matchingCourse = courses.find((course) => course.subject.toLowerCase() === subject.catalogSubject.toLowerCase());
              return (
                <div key={subject.id} style={{ borderRadius: 24, border: '1px solid #e6e8e3', background: '#fff', padding: 22 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 108, padding: '6px 10px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 11, fontWeight: 800, marginBottom: 16 }}>
                    {FORM_FOUR_CLASS?.name}
                  </div>
                  <h3 style={{ fontSize: 22, lineHeight: 1.15, fontWeight: 900, color: '#121212', marginBottom: 10 }}>{subject.name}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: '#54615a', marginBottom: 12 }}>{subject.description}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: '#1f4036', marginBottom: 20, fontWeight: 700 }}>{subject.confidenceLine}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <Link href={subject.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 16, background: '#121212', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
                      Explore Subject
                    </Link>
                    <span style={{ fontSize: 12, color: '#738079' }}>
                      {matchingCourse ? 'Live lessons available' : 'Subject ready for launch content'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {banners['campaign-banner'] && (
        <section style={{ padding: '0 24px 70px', background: LIGHT_BG }}>
          <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ aspectRatio: '1600 / 520', borderRadius: 28, overflow: 'hidden', background: `url(${banners['campaign-banner']}) center/cover no-repeat`, boxShadow: '0 28px 70px rgba(18,18,18,0.08)' }} />
          </div>
        </section>
      )}

      <section style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-how-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 22 }}>
            <div style={{ borderRadius: 28, background: '#121212', color: '#fff', padding: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#baf5d3', marginBottom: 10 }}>How Skolr works</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.08, fontWeight: 900, marginBottom: 12 }}>Learning Support That Builds Confidence.</h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', marginBottom: 18 }}>
                Students need clarity. Parents need structure. Skolr is built to deliver both without overwhelming the learner.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} style={{ borderRadius: 24, border: '1px solid #e6e8e3', background: '#fff', padding: 22, display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 22, background: '#e9fbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL, fontSize: 22, fontWeight: 900 }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#121212', marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: '#57635d' }}>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 34px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 22, border: '1px solid #cfe7da', background: 'linear-gradient(135deg,#f7fcf9 0%,#ffffff 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', boxShadow: '0 12px 28px rgba(18,18,18,0.04)' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>{REASSURANCE_BANNERS[1].eyebrow}</p>
              <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 900, color: '#121212', marginBottom: 4 }}>{REASSURANCE_BANNERS[1].title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5a645f' }}>{REASSURANCE_BANNERS[1].copy}</p>
            </div>
            <Link href={REASSURANCE_BANNERS[1].href} style={{ fontSize: 13, fontWeight: 800, color: '#047857', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {REASSURANCE_BANNERS[1].cta}
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 72px', background: LIGHT_BG }}>
        <div style={{ width: '100%' }}>
          <div
            className="launch-study-partner"
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 0,
              padding: '42px 24px',
              background: 'linear-gradient(120deg,#0f1c20 0%,#17363d 38%,#136a62 100%)',
              boxShadow: '0 28px 72px rgba(15,23,42,0.14)',
            }}
          >
            <div style={{ position: 'absolute', top: -90, right: -10, width: 280, height: 280, borderRadius: '50%', background: 'rgba(36,211,102,0.14)' }} />
            <div style={{ position: 'absolute', bottom: -130, left: '18%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(4,149,157,0.18)' }} />
            <div style={{ position: 'absolute', inset: 0, opacity: 0.22, background: 'radial-gradient(circle at 78% 30%, rgba(255,255,255,0.22), transparent 22%), linear-gradient(135deg, transparent 0%, transparent 52%, rgba(255,255,255,0.08) 52%, rgba(255,255,255,0.08) 54%, transparent 54%, transparent 100%)' }} />
            <div className="launch-shell launch-study-grid" style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(320px,0.95fr)', gap: 28, alignItems: 'center' }}>
              <div style={{ paddingRight: 8 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 18 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#d7fff1', textTransform: 'uppercase', letterSpacing: 0.5 }}>Virtual Study Partner</span>
                </div>
                <h2 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.08, color: '#fff', marginBottom: 12 }}>
                  A smarter study companion for calmer, stronger revision.
                </h2>
                <p style={{ maxWidth: 620, fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.74)', marginBottom: 22 }}>
                  Zeal helps students check understanding right after each lesson, build momentum between topics, and stay engaged without making revision feel heavy or confusing.
                </p>
                <div className="launch-final-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/register" style={{ padding: '14px 22px', borderRadius: 16, background: '#fff', color: '#121212', fontSize: 14, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Start for Free
                  </Link>
                  <Link href="/#mock-exams" style={{ padding: '14px 22px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.16)', color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    See how it works
                  </Link>
                </div>
              </div>

              <div className="launch-study-proof" style={{ display: 'grid', gap: 12 }}>
                {STUDY_PARTNER_POINTS.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      padding: '20px 20px 18px',
                      borderRadius: 22,
                      background: index === 1 ? 'rgba(36,211,102,0.18)' : 'rgba(255,255,255,0.09)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 14px 30px rgba(4,10,18,0.14)',
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{index === 0 ? 'Instant understanding checks' : index === 1 ? 'Motivation between lessons' : 'Better exam readiness'}</p>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 30, background: 'linear-gradient(135deg,#f7fbf8 0%,#ffffff 40%,#eef8f2 100%)', border: '1px solid #dfe6df', padding: 30 }}>
            <div className="launch-assurance-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.95fr) minmax(0,1.05fr)', gap: 24, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Parent assurance</p>
                <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 12 }}>
                  Reassurance Built Into Every Step.
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: '#5a645f' }}>
                  At launch, that promise is focused tightly on Form Four so the experience remains disciplined, trustworthy, and outcome-driven.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {PARENT_ASSURANCE.map((item) => (
                  <div key={item} style={{ borderRadius: 20, background: '#fff', border: '1px solid #e6e8e3', padding: 18, display: 'flex', gap: 12 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 999, background: '#ecfdf5', color: '#047857', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: '#4f5b55' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="teachers" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-section-head" style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Teachers</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Teaching Families Can Rely On.</h2>
              <p style={{ maxWidth: 720, fontSize: 15, lineHeight: 1.75, color: '#5a645f' }}>
                Instructors on Skolr are presented as calm academic guides, not noisy personalities.
              </p>
            </div>
          </div>
          <div className="launch-teacher-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
            {(teachers.length ? teachers : [
              { name: 'Mathematics instructor', subject: 'Mathematics', courseCount: 1 },
              { name: 'Science instructor', subject: 'Physics and Chemistry', courseCount: 1 },
              { name: 'Language instructor', subject: 'English', courseCount: 1 },
            ]).map((teacher, index) => (
              <div key={teacher.name} style={{ borderRadius: 24, border: '1px solid #e6e8e3', background: '#fff', padding: 22 }}>
                <div style={{ width: 62, height: 62, borderRadius: 20, background: index === 1 ? '#f0fdf4' : '#f5f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#047857' }}>{teacher.name.charAt(0)}</span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: '#121212', marginBottom: 8 }}>{teacher.name}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#58655e', marginBottom: 14 }}>
                  Teaching focus: {teacher.subject}. Designed to help Form Four learners understand, revise, and stay consistent.
                </p>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>{teacher.courseCount} live subject stream{teacher.courseCount === 1 ? '' : 's'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mock-exams" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 30, background: '#121212', padding: 30, color: '#fff' }}>
            <div className="launch-mock-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 24, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#86efac', marginBottom: 8 }}>Mock exams</p>
                <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, marginBottom: 12 }}>Exam Preparation You Can Trust.</h2>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)' }}>
                  Mock exams and revision planning are part of the Form Four direction from day one, helping learners move from lessons into exam confidence.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
                {[
                  ['Timed practice', 'Know how each paper feels under exam conditions.'],
                  ['Topic revision', 'Spot weak areas before they become final gaps.'],
                  ['Performance review', 'Turn every attempt into a clearer next step.'],
                ].map(([title, copy]) => (
                  <div key={title} style={{ borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
                    <h3 style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 900, marginBottom: 8 }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)' }}>{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="free-trial" style={{ padding: '0 24px 26px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 28, background: '#ffffff', border: '1px solid #e1e6e9', padding: 28, boxShadow: '0 20px 48px rgba(18,18,18,0.05)' }}>
            <div className="launch-trial-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,0.62fr)', gap: 20, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Start for free</p>
                <h2 style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 10 }}>Start with a free trial before committing to the full Form Four plan.</h2>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: '#5a645f' }}>
                  Review the structure, explore the subject flow, and get a feel for how Skolr teaches before moving into full monthly access.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  'Explore the Form Four subject catalog',
                  'Understand the teaching structure before payment',
                  'Move into full access when ready',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 16, background: '#f6f7f9', padding: '12px 14px' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 999, background: 'rgba(36,211,102,0.14)', color: '#0a7b3b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#3a464d' }}>{item}</span>
                  </div>
                ))}
                <Link href="/register" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, borderRadius: 16, background: GREEN, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Start for Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Pricing</p>
            <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 10 }}>Simple, Secure Access for Every Learner.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#5a645f' }}>One calm subscription. All visible Form Four subjects included.</p>
          </div>
          <div style={{ maxWidth: 520, margin: '0 auto', borderRadius: 30, background: '#fff', border: '1px solid #e6e8e3', padding: 30, boxShadow: '0 24px 60px rgba(18,18,18,0.05)' }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 10 }}>Form Four Monthly Access</p>
            <p style={{ fontSize: 46, fontWeight: 900, color: '#121212', marginBottom: 6 }}>
              {FORM_FOUR_PRICE_TZS.toLocaleString()} <span style={{ fontSize: 18, color: '#5f6a64', fontWeight: 700 }}>TZS/month</span>
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#5a645f', marginBottom: 18 }}>
              Includes all visible Form Four subjects: Mathematics, Physics, Chemistry, Biology, Bookkeeping, Computer Studies, and English.
            </p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
              {[
                'All public Form Four subject access',
                'Clear lesson progression and revision flow',
                'Progress tracking for consistency and confidence',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: '#ecfdf5', color: '#047857', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, lineHeight: 1.7, color: '#4e5b54' }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 52, borderRadius: 16, background: GREEN, color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 900 }}>
              Start for Free
            </Link>
          </div>
        </div>
      </section>

      <section id="success-stories" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-section-head" style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Success stories</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Results Families Can Feel Good About.</h2>
            </div>
          </div>
          <div className="launch-story-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
            {SUCCESS_STORIES.map((story) => (
              <div key={story.name} style={{ borderRadius: 24, border: '1px solid #e6e8e3', background: '#fff', padding: 24 }}>
                <p style={{ fontSize: 18, lineHeight: 1.7, color: '#1f2d27', marginBottom: 20 }}>&ldquo;{story.quote}&rdquo;</p>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#121212' }}>{story.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 78px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 30, background: 'linear-gradient(135deg,#121212 0%,#10231c 100%)', color: '#fff', padding: 34, textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#86efac', marginBottom: 10 }}>Final step</p>
            <h2 style={{ fontSize: 38, lineHeight: 1.05, fontWeight: 900, marginBottom: 12 }}>Begin Form Four Learning</h2>
            <p style={{ maxWidth: 700, margin: '0 auto 22px', fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.74)' }}>
              Give students the clarity to start, and the confidence to keep going until exam season.
            </p>
            <div className="launch-final-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" style={{ padding: '14px 22px', borderRadius: 16, background: '#fff', color: '#121212', fontSize: 15, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#121212', color: '#fff', padding: '34px 24px 28px' }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr', gap: 18, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 900 }}>Skolr</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>Master Form Four. Pass with Confidence.</p>
                </div>
              </div>
              <p style={{ maxWidth: 330, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.56)' }}>
                A focused Form Four learning platform built for calm revision, serious instruction, and exam confidence.
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.34)', marginBottom: 12 }}>Launch focus</p>
              <Link href="/courses?level=secondary&sub=Form%204" style={{ display: 'block', marginBottom: 9, fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Form Four Subjects</Link>
              <Link href="/#mock-exams" style={{ display: 'block', marginBottom: 9, fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Mock Exams</Link>
              <Link href="/#pricing" style={{ display: 'block', marginBottom: 9, fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pricing</Link>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.34)', marginBottom: 12 }}>Future ready</p>
              {['Form One', 'Form Two', 'Form Three', 'A-Level', 'Professional Courses'].map((item) => (
                <p key={item} style={{ marginBottom: 9, fontSize: 13, color: 'rgba(255,255,255,0.48)' }}>{item}</p>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.34)', marginBottom: 12 }}>Support</p>
              {[
                ['Login', '/login'],
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
                ['Contact', '/contact'],
              ].map(([label, href]) => (
                <Link key={label} href={href} style={{ display: 'block', marginBottom: 9, fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>
            <span>2026 Skolr. All rights reserved.</span>
            <span>Focused launch for Tanzania Form Four learners.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .launch-hero-grid,
          .launch-how-grid,
          .launch-study-grid,
          .launch-assurance-grid,
          .launch-mock-grid,
          .launch-footer-grid,
          .launch-subject-grid,
          .launch-teacher-grid,
          .launch-parent-panel,
          .launch-trial-grid {
            grid-template-columns: 1fr !important;
          }

          .launch-story-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .launch-parent-points {
            grid-template-columns: 1fr !important;
          }

          .launch-hero-content {
            padding: 42px 34px 38px !important;
            min-height: 560px !important;
          }
        }

        @media (max-width: 860px) {
          .launch-desktop-nav {
            display: none !important;
          }

          .launch-mobile-toggle {
            display: inline-flex !important;
          }

          .launch-hero-grid,
          .launch-how-grid,
          .launch-study-grid,
          .launch-assurance-grid,
          .launch-mock-grid,
          .launch-story-grid,
          .launch-footer-grid,
          .launch-parent-panel {
            grid-template-columns: 1fr !important;
          }

          .launch-benefit-grid,
          .launch-subject-grid,
          .launch-teacher-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .launch-shell,
          .launch-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .launch-hero-banner {
            min-height: 540px !important;
            border-radius: 24px !important;
          }

          .launch-hero-content {
            min-height: 540px !important;
            padding: 28px 22px 28px !important;
            align-items: flex-end !important;
          }

          .launch-hero-grid h1,
          .launch-hero-content h1 {
            font-size: 40px !important;
          }

          .launch-hero-actions,
          .launch-final-actions {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }

          .launch-benefit-grid,
          .launch-subject-grid,
          .launch-teacher-grid,
          .launch-story-grid {
            grid-template-columns: 1fr !important;
          }

          .launch-parent-points {
            grid-template-columns: 1fr !important;
          }

          .launch-hero-meta {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }

          .launch-mock-grid > div:last-child {
            grid-template-columns: 1fr !important;
          }

          .launch-how-grid > div:last-child > div {
            grid-template-columns: 58px minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
