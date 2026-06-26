'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/layout/Footer';
import TopHeader from '@/components/layout/TopHeader';
import ParentLearnerManager from '@/components/parent/ParentLearnerManager';
import { FORM_FOUR_CLASS, FORM_FOUR_SUBJECTS } from '../../../lib/launchCatalog';
import { isSubscriptionActive } from '@/lib/subscriptions';
import type { Course, EducationLevel, SubCategory } from '@/types';

const G = '#10B981';

const LEVELS = [
  { id: 'primary', label: 'Primary', sub: 'Standard 1-7', color: '#3b82f6', bg: '#eff6ff', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'secondary', label: 'Secondary', sub: 'Form 1-4', color: '#8b5cf6', bg: '#f5f3ff', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'highschool', label: 'High School', sub: 'Form 5-6', color: '#f59e0b', bg: '#fffbeb', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id: 'undergraduate', label: 'Undergraduate', sub: 'Year 1-3', color: '#10b981', bg: '#ecfdf5', icon: 'M12 14l9-5-9-5-9 5 9 5z' },
  { id: 'masters', label: 'Masters', sub: 'Postgraduate', color: '#ef4444', bg: '#fef2f2', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
];

type SummaryMetric = {
  label: string;
  value: string;
  hint: string;
};

type CourseProgressRow = {
  course_id: string;
  title: string;
  subject: string;
  category: EducationLevel;
  sub_category?: SubCategory;
  thumbnail_url?: string | null;
  instructor_name?: string;
  progress_seconds: number;
  duration_seconds: number;
  completion_percent: number;
  completed: boolean;
  last_activity_at: string | null;
};

type LearnerSnapshot = {
  id: string;
  full_name: string;
  education_level: EducationLevel;
  sub_category?: SubCategory;
  enrolled_courses: number;
  completed_courses: number;
  completion_percent: number;
  total_watch_minutes: number;
  last_activity_at: string | null;
  continue_learning: CourseProgressRow | null;
};

type DashboardAnalytics = {
  account_type: 'individual' | 'parent_guardian';
  summary: {
    learners_count?: number;
    active_courses: number;
    completed_courses: number;
    total_watch_minutes: number;
    average_completion_percent: number;
    focus_subject?: string | null;
  };
  continue_learning?: CourseProgressRow | null;
  course_progress?: CourseProgressRow[];
  active_learner?: LearnerSnapshot | null;
  learner_snapshots?: LearnerSnapshot[];
};

function Thumb({ color, bg, title, thumbnailUrl }: { color: string; bg: string; title: string; thumbnailUrl?: string | null }) {
  return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: `linear-gradient(135deg,${bg},${color}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: `${color}18` }} />
          <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{title.charAt(0)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function formatMinutes(totalMinutes: number) {
  if (!totalMinutes) return '0 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = totalMinutes / 60;
  return `${hours >= 10 ? Math.round(hours) : hours.toFixed(1)} hrs`;
}

function formatRelativeDate(value?: string | null) {
  if (!value) return 'No study activity yet';
  const ms = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(ms / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short' });
}

function levelLabel(level: EducationLevel, subCategory?: string | null) {
  const meta = LEVELS.find((entry) => entry.id === level);
  if (!meta) return subCategory || 'Learner';
  return subCategory ? `${meta.label} · ${subCategory}` : meta.label;
}

function isLaunchCourse(row: { category: EducationLevel; sub_category?: SubCategory | null }) {
  return row.category === FORM_FOUR_CLASS.level && row.sub_category === FORM_FOUR_CLASS.subCategory;
}

function buildSummaryMetrics(analytics: DashboardAnalytics | null, isParentAccount: boolean): SummaryMetric[] {
  if (!analytics) return [];

  if (isParentAccount) {
    return [
      {
        label: 'Learners',
        value: String(analytics.summary.learners_count || 0),
        hint: 'Profiles linked to this parent account',
      },
      {
        label: 'Courses in motion',
        value: String(analytics.summary.active_courses || 0),
        hint: 'Enrollments across all linked learners',
      },
      {
        label: 'Average completion',
        value: `${analytics.summary.average_completion_percent || 0}%`,
        hint: 'Average progress across learner course sets',
      },
      {
        label: 'Study time',
        value: formatMinutes(analytics.summary.total_watch_minutes || 0),
        hint: 'Combined watch time from all learner profiles',
      },
    ];
  }

  return [
    {
      label: 'Active courses',
      value: String(analytics.summary.active_courses || 0),
      hint: 'Courses currently on your learning track',
    },
    {
      label: 'Completed',
      value: String(analytics.summary.completed_courses || 0),
      hint: 'Courses you have already finished',
    },
    {
      label: 'Average progress',
      value: `${analytics.summary.average_completion_percent || 0}%`,
      hint: 'Completion across your active course list',
    },
    {
      label: 'Focus subject',
      value: analytics.summary.focus_subject || 'Keep going',
      hint: 'Where your watch time is strongest right now',
    },
  ];
}

export default function HomePage() {
  const { user, refetch } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [fetching, setFetching] = useState(true);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [router, user?.role]);

  useEffect(() => {
    if (!user || user.role === 'admin') return;

    setFetching(true);
    fetch('/api/courses?level=secondary&sub=Form%204&per_page=6', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCourses(d.data.items || []);
      })
      .finally(() => setFetching(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.role === 'admin') return;

    setAnalyticsLoading(true);
    fetch('/api/dashboard/analytics', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAnalytics(d.data || null);
      })
      .finally(() => setAnalyticsLoading(false));
  }, [user]);

  if (!user) return null;
  if (user.role === 'admin') return null;

  const isActive = isSubscriptionActive(user.subscription_expires_at);
  const firstName = user.name?.split(' ')[0] || 'there';
  const isParentAccount = user.account_type === 'parent_guardian';
  const summaryMetrics = buildSummaryMetrics(analytics, isParentAccount);
  const continueLearningSource = isParentAccount ? analytics?.active_learner?.continue_learning || null : analytics?.continue_learning || null;
  const continueLearning = continueLearningSource && isLaunchCourse(continueLearningSource) ? continueLearningSource : null;
  const progressRows = (analytics?.course_progress || []).filter(isLaunchCourse);
  const learnerSnapshots = analytics?.learner_snapshots || [];
  const launchCourses = courses.filter((course) => isLaunchCourse(course));
  const recommendedLesson = continueLearning || progressRows.find((row) => !row.completed) || progressRows[0] || null;
  const revisionPlanRows = [...progressRows].sort((a, b) => a.completion_percent - b.completion_percent).slice(0, 3);
  const subjectProgressRows = FORM_FOUR_SUBJECTS.map((subject) => {
    const matchingRows = progressRows.filter((row) => row.subject.toLowerCase() === subject.catalogSubject.toLowerCase());
    const averageCompletion = matchingRows.length
      ? Math.round(matchingRows.reduce((sum, row) => sum + row.completion_percent, 0) / matchingRows.length)
      : 0;
    const totalMinutes = matchingRows.reduce((sum, row) => sum + Math.round(row.progress_seconds / 60), 0);
    const nextCourse = matchingRows[0] || launchCourses.find((course) => course.subject.toLowerCase() === subject.catalogSubject.toLowerCase()) || null;

    return {
      subject,
      averageCompletion,
      totalMinutes,
      activeRows: matchingRows.length,
      nextCourse,
    };
  });
  const dashboardTitle = isParentAccount ? 'Form Four Family Dashboard' : 'Form Four Dashboard';

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#0a0a0a' }}>
      <TopHeader />

      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 60%,#0d2818 100%)', padding: '32px 24px' }}>
        <div className="dashboard-hero-inner" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Welcome back, {firstName}</p>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{dashboardTitle}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              {isParentAccount
                ? (isActive ? 'Track progress, revision consistency, and mock readiness for Form Four learners.' : 'Start Form Four access to unlock the full revision path for your learner.')
                : (isActive ? 'Your next Form Four lesson, revision focus, and exam preparation live here.' : 'Start your Form Four access to unlock every visible subject.')}
            </p>
            {user.active_learner_name && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.3)', color: '#d1fae5', fontSize: 12, fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                Learning as {user.active_learner_name}
              </div>
            )}
          </div>
          <div className="dashboard-hero-stats" style={{ display: 'flex', gap: 24 }}>
            {([
              ['Plan', user.subscription_tier?.replace(/_/g, ' ') || 'Free', '#fff'],
              ['Access', isActive ? 'Active' : 'None', isActive ? G : '#ef4444'],
            ] as [string, string, string][]).map(([label, value, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color }}>{value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
          {!isActive && (
            <Link href="/settings" style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 8, textDecoration: 'none' }}>
              Start free trial
            </Link>
          )}
        </div>
      </div>

      <div className="dashboard-shell" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Performance Summary</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                {isParentAccount ? 'See how each learner is moving and who should continue next.' : 'A focused snapshot of how your Form Four study plan is progressing.'}
              </p>
            </div>
            {isParentAccount && analytics?.active_learner && (
              <div style={{ padding: '10px 14px', borderRadius: 999, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#047857', fontSize: 12, fontWeight: 700 }}>
                Active learner: {analytics.active_learner.full_name}
              </div>
            )}
          </div>

          {analyticsLoading ? (
            <div className="analytics-loading-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} style={{ borderRadius: 16, border: '1px solid #e5e7eb', background: '#f8fafc', padding: 18 }}>
                  <div style={{ height: 11, width: '42%', background: '#e5e7eb', borderRadius: 999, marginBottom: 12 }} />
                  <div style={{ height: 28, width: '58%', background: '#e5e7eb', borderRadius: 10, marginBottom: 8 }} />
                  <div style={{ height: 10, width: '88%', background: '#eef2f7', borderRadius: 999 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
              {summaryMetrics.map((metric) => (
                <div key={metric.label} style={{ borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff', padding: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: '#6b7280', marginBottom: 10 }}>{metric.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>{metric.value}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{metric.hint}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-progress-shell" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 32 }}>
          <div style={{ borderRadius: 20, border: '1px solid #e5e7eb', background: 'linear-gradient(180deg,#0f172a 0%,#101827 100%)', color: '#fff', padding: 22 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#86efac', marginBottom: 10 }}>
              {isParentAccount ? 'Continue learner session' : 'Continue learning'}
            </p>
            {continueLearning ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.14)', color: '#d1fae5' }}>{continueLearning.subject}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{levelLabel(continueLearning.category, continueLearning.sub_category)}</span>
                  {isParentAccount && analytics?.active_learner && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>for {analytics.active_learner.full_name}</span>
                  )}
                </div>
                <h3 style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 800, marginBottom: 10 }}>{continueLearning.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 620, marginBottom: 18 }}>
                  {continueLearning.completion_percent}% complete with {formatMinutes(Math.round(continueLearning.progress_seconds / 60))} already invested. Your next session can resume straight from the current course watch flow.
                </p>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ width: '100%', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(6, continueLearning.completion_percent)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10B981,#6ee7b7)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.56)' }}>
                    <span>{continueLearning.instructor_name || 'Skolr instructor'}</span>
                    <span>{formatRelativeDate(continueLearning.last_activity_at)}</span>
                  </div>
                </div>
                <div className="continue-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href={`/watch/${continueLearning.course_id}`} style={{ padding: '12px 18px', borderRadius: 12, textDecoration: 'none', background: '#10B981', color: '#052e1a', fontSize: 13, fontWeight: 800 }}>
                    Resume course
                  </Link>
                  <Link href={`/courses/${continueLearning.course_id}`} style={{ padding: '12px 18px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                    View course details
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 800, marginBottom: 10 }}>Your next study block starts here.</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 620, marginBottom: 18 }}>
                  {isParentAccount
                    ? 'Once a learner opens classes, their strongest active course will appear here with a clear resume path.'
                    : 'Open a course and your resume-friendly progress view will begin building here automatically.'}
                </p>
                <Link href="/courses" style={{ display: 'inline-flex', padding: '12px 18px', borderRadius: 12, textDecoration: 'none', background: '#fff', color: '#0a0a0a', fontSize: 13, fontWeight: 800 }}>
                  Browse courses
                </Link>
              </>
            )}
          </div>

          <div style={{ borderRadius: 20, border: '1px solid #e5e7eb', background: '#f8fafc', padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#10B981', marginBottom: 10 }}>
              {isParentAccount ? 'Household momentum' : 'Today’s recommended lesson'}
            </p>
            {isParentAccount ? (
              <>
                <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 800, marginBottom: 10 }}>See who is moving fastest and who needs the next study push.</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {(learnerSnapshots.slice(0, 3)).map((snapshot) => (
                    <div key={snapshot.id} style={{ borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff', padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{snapshot.full_name}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>{levelLabel(snapshot.education_level, snapshot.sub_category)}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>{snapshot.completion_percent}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ width: `${Math.max(4, snapshot.completion_percent)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10B981,#86efac)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#6b7280' }}>
                        <span>{snapshot.enrolled_courses} courses</span>
                        <span>{formatRelativeDate(snapshot.last_activity_at)}</span>
                      </div>
                    </div>
                  ))}
                  {learnerSnapshots.length === 0 && (
                    <div style={{ borderRadius: 16, border: '1px dashed #d1d5db', padding: 18, color: '#6b7280', fontSize: 13 }}>
                      Add a learner profile to start seeing progress snapshots here.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {recommendedLesson ? (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ borderRadius: 18, border: '1px solid #e5e7eb', background: '#fff', padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, background: '#ecfdf5', color: '#047857' }}>{recommendedLesson.subject}</span>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>{formatRelativeDate(recommendedLesson.last_activity_at)}</span>
                      </div>
                      <h3 style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 800, marginBottom: 8 }}>{recommendedLesson.title}</h3>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7280', marginBottom: 14 }}>
                        {recommendedLesson.completion_percent}% complete with {formatMinutes(Math.round(recommendedLesson.progress_seconds / 60))} already invested. Continue from where you stopped and keep your revision flow steady.
                      </p>
                      <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', marginBottom: 14 }}>
                        <div style={{ width: `${Math.max(4, recommendedLesson.completion_percent)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10B981,#86efac)' }} />
                      </div>
                      <div className="continue-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link href={`/watch/${recommendedLesson.course_id}`} style={{ padding: '10px 16px', borderRadius: 10, textDecoration: 'none', background: '#0a0a0a', color: '#fff', fontSize: 13, fontWeight: 800 }}>
                          Open lesson
                        </Link>
                        <Link href={`/courses/${recommendedLesson.course_id}`} style={{ padding: '10px 16px', borderRadius: 10, textDecoration: 'none', border: '1px solid #d1d5db', color: '#111827', fontSize: 13, fontWeight: 700 }}>
                          View overview
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderRadius: 16, border: '1px dashed #d1d5db', background: '#fff', padding: 18, color: '#6b7280', fontSize: 13 }}>
                    Start one Form Four lesson and your recommended next step will appear here automatically.
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {isParentAccount && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Learner snapshots</h2>
                <p style={{ fontSize: 14, color: '#6b7280' }}>A cleaner at-a-glance view before you open full learner management.</p>
              </div>
            </div>
            <div className="learner-snapshot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
              {learnerSnapshots.map((snapshot) => (
                <div key={snapshot.id} style={{ borderRadius: 18, border: '1px solid #e5e7eb', background: '#fff', padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{snapshot.full_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{levelLabel(snapshot.education_level, snapshot.sub_category)}</p>
                    </div>
                    {user.active_learner_profile_id === snapshot.id && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, background: '#ecfdf5', color: '#047857' }}>Active</span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
                    <div style={{ borderRadius: 14, background: '#f8fafc', padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Progress</p>
                      <p style={{ fontSize: 20, fontWeight: 800 }}>{snapshot.completion_percent}%</p>
                    </div>
                    <div style={{ borderRadius: 14, background: '#f8fafc', padding: 12 }}>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Study time</p>
                      <p style={{ fontSize: 20, fontWeight: 800 }}>{formatMinutes(snapshot.total_watch_minutes)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    <span>{snapshot.enrolled_courses} courses</span>
                    <span>{snapshot.completed_courses} completed</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                    {snapshot.continue_learning ? `Next: ${snapshot.continue_learning.title}` : 'No active course yet'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {snapshot.continue_learning ? (
                      <Link href={`/watch/${snapshot.continue_learning.course_id}`} style={{ padding: '10px 14px', borderRadius: 10, textDecoration: 'none', background: '#0a0a0a', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                        Open class
                      </Link>
                    ) : (
                      <Link href="/courses" style={{ padding: '10px 14px', borderRadius: 10, textDecoration: 'none', background: '#0a0a0a', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                        Find course
                      </Link>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, color: '#6b7280' }}>{formatRelativeDate(snapshot.last_activity_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isParentAccount && (
          <div style={{ marginBottom: 32 }}>
            <ParentLearnerManager user={user} refetchUser={async () => {
              await refetch();
              const res = await fetch('/api/dashboard/analytics', { credentials: 'include' });
              const data = await res.json();
              if (data.success) setAnalytics(data.data || null);
            }} variant="dashboard" />
          </div>
        )}

        {!isParentAccount && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Subject Progress</h2>
                <p style={{ fontSize: 14, color: '#6b7280' }}>A clean subject-by-subject view of your Form Four consistency and revision depth.</p>
              </div>
            </div>
            <div className="subject-progress-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
              {subjectProgressRows.map((entry) => (
                <div key={entry.subject.id} style={{ borderRadius: 18, border: '1px solid #e5e7eb', background: '#fff', padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{entry.subject.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{entry.activeRows > 0 ? `${entry.activeRows} active lesson${entry.activeRows === 1 ? '' : 's'}` : 'Ready when you are'}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>{entry.averageCompletion}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ width: `${Math.max(4, entry.averageCompletion)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10B981,#86efac)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                    <span>{formatMinutes(entry.totalMinutes)}</span>
                    <span>{entry.nextCourse ? 'Continue available' : 'Start subject'}</span>
                  </div>
                  <Link
                    href={entry.nextCourse ? `/watch/${entry.nextCourse.id}` : entry.subject.href}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 14px', borderRadius: 10, textDecoration: 'none', background: '#0a0a0a', color: '#fff', fontSize: 12, fontWeight: 800 }}
                  >
                    {entry.nextCourse ? 'Continue Subject' : 'Explore Subject'}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Mock Exams</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Practice in a way that feels closer to the final exam, with a clear purpose for each session.</p>
            </div>
          </div>
          <div className="mock-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
            {[
              ['Timed practice', 'Simulate real exam pressure with guided timing and focus.'],
              ['Topic revision', 'Target weaker areas before moving into full-paper practice.'],
              ['Performance review', 'Use your results to shape the next revision plan.'],
            ].map(([title, copy]) => (
              <div key={title} style={{ borderRadius: 18, border: '1px solid #e5e7eb', background: '#fff', padding: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#10B981', marginBottom: 10 }}>Form Four Exam Prep</p>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7280' }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Revision Plan</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>The clearest next subjects to revisit based on your current progress.</p>
            </div>
          </div>
          {revisionPlanRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Your revision plan will begin appearing here after your first study session.</p>
            </div>
          ) : (
            <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {revisionPlanRows.map((row) => (
                <div key={row.course_id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, background: '#ecfdf5', color: '#047857' }}>{row.subject}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{row.completion_percent}% complete</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>{row.title}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: '#6b7280', marginBottom: 14 }}>
                    Return to this lesson to strengthen a weaker area before your next mock exam session.
                  </p>
                  <Link href={`/watch/${row.course_id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 14px', borderRadius: 10, textDecoration: 'none', background: '#0a0a0a', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                    Resume Revision
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Form Four Subjects</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Explore the subjects available in your launch access plan.</p>
            </div>
            <Link href="/courses?level=secondary&sub=Form%204" style={{ fontSize: 13, fontWeight: 700, color: G, textDecoration: 'none' }}>View subject catalog</Link>
          </div>
          {fetching ? (
            <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <div style={{ height: 160, background: '#f3f4f6' }} />
                  <div style={{ padding: 14 }}>
                    <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 10, background: '#f3f4f6', borderRadius: 4, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : launchCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Form Four courses will appear here as soon as they are published.</p>
            </div>
          ) : (
            <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {launchCourses.map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`} className="course-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <Thumb color="#10B981" bg="#ecfdf5" title={c.title} thumbnailUrl={c.thumbnail_url} />
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#ecfdf5', color: '#047857' }}>{c.sub_category || 'Form Four'}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{c.subject}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 6 }}>{c.title}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>{c.instructor_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{FORM_FOUR_CLASS.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#0a0a0a' : G }}>
                        {isActive ? 'Watch now' : 'Start access'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!isActive && (
          <div style={{ background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)', borderRadius: 16, padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Unlock all courses</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Start your 7-day free trial — no payment needed.</p>
            </div>
            <Link href="/settings" style={{ padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#0a0a0a', background: '#fff', borderRadius: 8, textDecoration: 'none' }}>Start free trial</Link>
          </div>
        )}
      </div>

      <Footer />
      <style jsx>{`
        @media (max-width: 1100px) {
          .dashboard-progress-shell,
          .learner-snapshot-grid,
          .analytics-grid,
          .analytics-loading-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 900px) {
          .course-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .dashboard-progress-shell {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .subject-progress-grid,
          .mock-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .dashboard-hero {
            padding: 22px 16px !important;
          }

          .dashboard-hero-inner {
            align-items: flex-start !important;
          }

          .dashboard-hero-stats {
            width: 100%;
            justify-content: flex-start;
            gap: 18px !important;
          }

          .dashboard-shell {
            padding: 24px 16px 104px !important;
          }

          .analytics-grid,
          .analytics-loading-grid,
          .learner-snapshot-grid,
          .subject-progress-grid,
          .mock-grid,
          .course-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .course-card,
          .progress-row {
            min-width: 0;
          }

          .continue-actions {
            flex-direction: column;
          }

          .continue-actions :global(a) {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .progress-row {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .parent-learner-grid,
          .parent-learner-form-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .parent-learner-grid button {
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
