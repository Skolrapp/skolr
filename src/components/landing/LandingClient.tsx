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
let landingCoursesCache: LandingCourse[] | null = null;
let landingBrandingCache: Record<string, string | null> | null = null;

type LandingClientProps = {
  initialCourses: LandingCourse[];
  initialBanners: Record<string, string | null>;
};

type LandingCourse = Course & {
  instructor_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  education?: string | null;
  experience?: string | null;
};

const TRUST_CARDS = [
  {
    title: 'Form Four focused learning',
    copy: 'The public Skolr journey is built around Form Four only, so students and parents are not distracted by unrelated levels.',
    icon: 'target',
  },
  {
    title: 'Subject-by-subject preparation',
    copy: 'Mathematics, Physics, Chemistry, Biology, Bookkeeping, Computer Studies, and English each follow their own clear revision path.',
    icon: 'path',
  },
  {
    title: 'Parent progress visibility',
    copy: 'Parents can track consistency and understand how learning is moving, instead of waiting only for tuition feedback.',
    icon: 'chart',
  },
  {
    title: 'Mobile-money friendly access',
    copy: 'Skolr is being prepared for a payment flow that fits the Tanzanian market and everyday family habits.',
    icon: 'wallet',
  },
] as const;

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose a subject', copy: 'Start with the Form Four subject that needs the most attention right now.' },
  { step: '02', title: 'Learn with clear lessons', copy: 'Follow focused explanations built to reduce confusion and build confidence.' },
  { step: '03', title: 'Practice for exams', copy: 'Use revision guidance and mock-focused study to prepare with purpose.' },
] as const;

const TUITION_COMPARISON = [
  {
    side: 'Traditional tuition',
    points: [
      'Fixed schedule',
      'Hard to replay missed explanations',
      'Parent may not see daily progress',
      'Can become expensive across subjects',
    ],
  },
  {
    side: 'Skolr',
    points: [
      'Study anytime',
      'Replay lessons',
      'Structured Form Four path',
      'Parent progress visibility',
      '15,000 TZS/month access',
    ],
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'What exactly is free?',
    answer: 'Parents and students can preview selected Form Four lessons before choosing full monthly access.',
  },
  {
    question: 'What happens after I pay?',
    answer: 'The account moves into monthly Form Four access so the learner can continue across the visible subjects with progress tracking.',
  },
  {
    question: 'Is Skolr live or recorded?',
    answer: 'The current experience is built around recorded lesson support so students can replay explanations when needed.',
  },
  {
    question: 'Can my child study on a phone?',
    answer: 'Yes. The platform is being shaped for mobile use so students can learn on a phone without losing the lesson structure.',
  },
  {
    question: 'Does Skolr replace tuition?',
    answer: 'Skolr is positioned as a structured support layer. Families can use it alongside tuition or as an additional revision path at home.',
  },
  {
    question: 'How does a parent know the child is progressing?',
    answer: 'Skolr is built to make lesson progress and study consistency more visible instead of leaving parents to guess.',
  },
  {
    question: 'Which subjects are currently available?',
    answer: 'The public launch is focused on seven Form Four subjects: Mathematics, Physics, Chemistry, Biology, Bookkeeping, Computer Studies, and English.',
  },
  {
    question: 'Can I pay with mobile money?',
    answer: 'That is the intended direction for the Tanzanian market, and the pricing flow is being prepared with mobile-money support in mind.',
  },
] as const;

type TeacherProfile = {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  philosophy: string;
  courseCount: number;
  avatar_url?: string | null;
};

function getTeacherProfiles(courses: LandingCourse[]) {
  const grouped = new Map<string, TeacherProfile>();

  courses.forEach((course) => {
    const teacherId = course.instructor_id || course.instructor_name || course.title;
    const name = course.instructor_name || 'Skolr instructor';
    const current = grouped.get(teacherId);
    if (current) {
      current.courseCount += 1;
      return;
    }
    grouped.set(teacherId, {
      id: teacherId,
      name,
      subject: course.subject,
      qualification: course.education || '',
      experience: course.experience || '',
      philosophy: course.bio || '',
      courseCount: 1,
      avatar_url: course.avatar_url || null,
    });
  });

  return Array.from(grouped.values());
}

export default function LandingClient({ initialCourses, initialBanners }: LandingClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courses, setCourses] = useState<LandingCourse[]>(landingCoursesCache || initialCourses);
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
            const parsed = JSON.parse(cachedCourses) as LandingCourse[];
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
        const nextCourses = ((coursesResult.value as { data?: { items?: LandingCourse[] } }).data?.items || []).filter(
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

  const teachers = getTeacherProfiles(courses);
  const teacherStrip = teachers.length > 1 ? [...teachers, ...teachers] : teachers;

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
                  Premium Form Four exam preparation with structured lessons, subject-by-subject revision, and parent-friendly progress visibility for Tanzania families.
                </p>
                <div className="launch-hero-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 2 }}>
                  <Link href="/register" style={{ minHeight: 54, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', borderRadius: 16, background: GREEN, color: '#fff', fontSize: 14, fontWeight: 900, textDecoration: 'none', letterSpacing: 0.2, boxShadow: '0 18px 40px rgba(36,211,102,0.18)' }}>
                    Try Skolr Free
                  </Link>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.68)', marginBottom: 0 }}>
                  Preview selected Form Four lessons before choosing full monthly access.
                </p>
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
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 0 }}>Focused support for serious Form Four preparation.</h2>
            </div>
          </div>
          <div className="launch-benefit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
            {TRUST_CARDS.map((point) => (
              <div key={point.title} style={{ borderRadius: 22, border: '1px solid #e6e8e3', background: '#fff', padding: 20, boxShadow: '0 12px 28px rgba(18,18,18,0.04)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: '#e9fbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {point.icon === 'path' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><path d="M4 18c4 0 4-12 8-12s4 12 8 12" /><path d="M4 18h3" /><path d="M17 18h3" /></svg>}
                  {point.icon === 'target' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 2v3" /></svg>}
                  {point.icon === 'chart' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><path d="M4 19h16" /><path d="M7 16v-4" /><path d="M12 16V8" /><path d="M17 16v-6" /></svg>}
                  {point.icon === 'wallet' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M16 12h2" /><path d="M7 10h5" /></svg>}
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 800, color: '#121212', marginBottom: 8 }}>{point.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 34px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 24, border: '1px solid #dfe6e3', background: '#fff', padding: '22px 24px', boxShadow: '0 12px 28px rgba(18,18,18,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>Practical comparison</p>
                <h3 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 900, color: '#121212', marginBottom: 6 }}>Why Skolr instead of relying only on tuition?</h3>
              </div>
            </div>
            <div className="launch-story-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
              {TUITION_COMPARISON.map((column, index) => (
                <div key={column.side} style={{ borderRadius: 20, padding: 20, background: index === 1 ? 'linear-gradient(180deg,#f2fbf6 0%,#ffffff 100%)' : '#f8fafc', border: `1px solid ${index === 1 ? '#cfe7da' : '#e5e7eb'}` }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#121212', marginBottom: 12 }}>{column.side}</p>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {column.points.map((point) => (
                      <div key={point} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 22, height: 22, borderRadius: 999, background: index === 1 ? '#dcfce7' : '#e5e7eb', color: index === 1 ? '#047857' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                          {index === 1 ? '✓' : '•'}
                        </span>
                        <span style={{ fontSize: 14, lineHeight: 1.7, color: '#475569' }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="subjects" style={{ padding: '34px 24px 70px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-section-head" style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Form Four subjects</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Progress You Can Trust.</h2>
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
                      {matchingCourse ? 'Preview lesson' : 'Start learning'}
                  </Link>
                    <span style={{ fontSize: 12, color: '#738079' }}>
                      {matchingCourse ? 'Preview lessons available' : 'Lessons coming soon'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-how-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 22 }}>
            <div style={{ borderRadius: 28, background: '#121212', color: '#fff', padding: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#baf5d3', marginBottom: 10 }}>How Skolr works</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.08, fontWeight: 900, marginBottom: 12 }}>Learning Support That Builds Confidence.</h2>
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

      <section style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 30, background: 'linear-gradient(135deg,#f7fbf8 0%,#ffffff 40%,#eef8f2 100%)', border: '1px solid #dfe6df', padding: 30 }}>
            <div className="launch-assurance-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.95fr) minmax(0,1.05fr)', gap: 24, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Parent support</p>
                <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 12 }}>
                  What parents are actually looking for.
                </h2>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  'Form Four is the only public focus, so the learning path stays clear.',
                  'Parents can follow progress habits instead of guessing whether revision happened.',
                  'The monthly offer is simple to understand and designed for steady exam preparation.',
                ].map((item) => (
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
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Meet the teachers behind the subjects.</h2>
              {teachers.length > 0 && (
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64706a', margin: 0 }}>
                  {teachers.length} real instructor{teachers.length === 1 ? '' : 's'} currently visible on the public Form Four journey.
                </p>
              )}
            </div>
            <Link href="/instructors" style={{ fontSize: 13, fontWeight: 800, color: '#047857', textDecoration: 'none' }}>
              View all instructors
            </Link>
          </div>
          {teachers.length ? (
            <div className="launch-teacher-marquee">
              <div className="launch-teacher-track">
                {teacherStrip.map((teacher, index) => (
                  <Link href={`/instructors/${teacher.id}`} key={`${teacher.id}-${index}`} className="launch-teacher-card" style={{ borderRadius: 24, border: '1px solid #e6e8e3', background: '#fff', padding: 22, textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: index % 2 === 1 ? '#f0fdf4' : '#f5f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid #d9efe1' }}>
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#047857' }}>{teacher.name.charAt(0)}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: '#121212', marginBottom: 8 }}>{teacher.name}</h3>
                    <div style={{ display: 'grid', gap: 10 }}>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: '#58655e', margin: 0 }}><strong>Subject taught:</strong> {teacher.subject}</p>
                      {teacher.qualification && (
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#58655e', margin: 0 }}><strong>Qualification:</strong> {teacher.qualification}</p>
                      )}
                      {teacher.experience && (
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#58655e', margin: 0 }}><strong>Experience:</strong> {teacher.experience}</p>
                      )}
                      {teacher.philosophy && (
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#58655e', margin: 0 }}><strong>Teaching philosophy:</strong> {teacher.philosophy}</p>
                      )}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#047857', marginTop: 14 }}>{teacher.courseCount} live subject stream{teacher.courseCount === 1 ? '' : 's'}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: 24, border: '1px dashed #d7ded9', background: '#fff', padding: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#121212', marginBottom: 6 }}>No instructors are live on the public homepage yet.</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64706a' }}>Teacher profiles will appear here automatically once active instructor accounts have published Form Four lessons.</p>
            </div>
          )}
        </div>
      </section>

      <section id="mock-exams" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ borderRadius: 30, background: '#121212', padding: 30, color: '#fff' }}>
            <div className="launch-mock-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 24, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#86efac', marginBottom: 8 }}>Mock exams</p>
                <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, marginBottom: 12 }}>Exam Preparation You Can Trust.</h2>
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

      <section id="pricing" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>Pricing</p>
            <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 10 }}>15,000 TZS/month for focused Form Four support.</h2>
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
                'Access to Form Four learning support',
                'Monthly access',
                'Mobile money payment supported',
                'Start with a free preview',
                'No confusing long-term commitment language',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: '#ecfdf5', color: '#047857', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, lineHeight: 1.7, color: '#4e5b54' }}>{item}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5a645f', marginBottom: 16 }}>
              Built for parents who want structure, visibility, and consistent exam preparation without depending only on tuition.
            </p>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 52, borderRadius: 16, background: GREEN, color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 900 }}>
              Try Skolr Free
            </Link>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: '#6b7280', textAlign: 'center', marginTop: 10 }}>
              Preview selected Form Four lessons before choosing full monthly access.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: '0 24px 72px', background: LIGHT_BG }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-section-head" style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: TEAL, marginBottom: 8 }}>FAQ</p>
              <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 900, color: '#121212', marginBottom: 8 }}>Frequently asked questions.</h2>
            </div>
          </div>
          <div className="launch-story-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} style={{ borderRadius: 24, border: '1px solid #e6e8e3', background: '#fff', padding: 24 }}>
                <p style={{ fontSize: 18, lineHeight: 1.4, color: '#121212', marginBottom: 12, fontWeight: 900 }}>{item.question}</p>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#55616d' }}>{item.answer}</p>
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
            <div className="launch-final-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" style={{ padding: '14px 22px', borderRadius: 16, background: '#fff', color: '#121212', fontSize: 15, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Try Skolr Free
              </Link>
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>
              Preview selected Form Four lessons before choosing full monthly access.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ background: '#121212', color: '#fff', padding: '34px 24px 28px' }}>
        <div className="launch-shell" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="launch-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr', gap: 18, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
            <span>Premium Form Four exam preparation for Tanzania families.</span>
          </div>
        </div>
      </footer>

      <style>{`
        .launch-teacher-marquee {
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        .launch-teacher-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: teacher-marquee 34s linear infinite;
        }

        .launch-teacher-card {
          width: 340px;
          flex: 0 0 340px;
        }

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

          .launch-teacher-marquee {
            overflow-x: auto;
            overflow-y: hidden;
            mask-image: none;
            -webkit-mask-image: none;
            padding-bottom: 6px;
          }

          .launch-teacher-track {
            animation: none !important;
            width: max-content;
          }

          .launch-teacher-card {
            width: min(72vw, 320px);
            flex: 0 0 min(72vw, 320px);
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

          .launch-teacher-card {
            width: min(86vw, 300px);
            flex: 0 0 min(86vw, 300px);
          }
        }

        @keyframes teacher-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 8px));
          }
        }
      `}</style>
    </div>
  );
}
