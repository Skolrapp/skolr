'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/layout/Footer';
import TopHeader from '@/components/layout/TopHeader';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import { EDUCATION_LEVELS } from '@/lib/constants';
import type { Course, EducationLevel, LearnerProfile } from '@/types';

const G = '#10B981';

const LEVELS = [
  { id: 'primary',       label: 'Primary',       sub: 'Standard 1-7',   color: '#3b82f6', bg: '#eff6ff', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'secondary',     label: 'Secondary',     sub: 'Form 1-4',        color: '#8b5cf6', bg: '#f5f3ff', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'highschool',    label: 'High School',   sub: 'Form 5-6',        color: '#f59e0b', bg: '#fffbeb', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id: 'undergraduate', label: 'Undergraduate', sub: 'Year 1-3',        color: '#10b981', bg: '#ecfdf5', icon: 'M12 14l9-5-9-5-9 5 9 5z' },
  { id: 'masters',       label: 'Masters',       sub: 'Postgraduate',    color: '#ef4444', bg: '#fef2f2', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
];

function Thumb({ color, bg, title, thumbnailUrl }: { color: string; bg: string; title: string; thumbnailUrl?: string | null }) {
  return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,' + bg + ',' + color + '22)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: color + '18' }} />
          <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{title.charAt(0)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, refetch } = useAuth();
  const router = useRouter();
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [fetching, setFetching] = useState(true);
  const [learnerProfiles, setLearnerProfiles] = useState<LearnerProfile[]>([]);
  const [addingLearner, setAddingLearner] = useState(false);
  const [switchingLearnerId, setSwitchingLearnerId] = useState<string | null>(null);
  const [parentLearnerForm, setParentLearnerForm] = useState({
    full_name: '',
    education_level: 'primary' as EducationLevel,
    sub_category: 'Std 1',
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [router, user?.role]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') return;
    fetch('/api/courses?per_page=6', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setCourses(d.data.items); })
      .finally(() => setFetching(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    fetch('/api/learner-profiles', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setLearnerProfiles(d.data || []); });
  }, [user]);

  if (!user) return null;
  if (user.role === 'admin') return null;

  const isActive  = isSubscriptionActive(user.subscription_expires_at);
  const firstName = user.name?.split(' ')[0] || 'there';
  const isParentAccount = user.account_type === 'parent_guardian';
  const selectedParentLevel = EDUCATION_LEVELS.find((entry) => entry.key === parentLearnerForm.education_level);

  const addLearnerProfile = async () => {
    if (!parentLearnerForm.full_name.trim()) return;
    const res = await fetch('/api/learner-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(parentLearnerForm),
    });
    const data = await res.json();
    if (data.success) {
      setLearnerProfiles((current) => [...current, data.data]);
      setParentLearnerForm({ full_name: '', education_level: 'primary', sub_category: 'Std 1' });
      setAddingLearner(false);
      await refetch();
    }
  };

  const setActiveLearner = async (learnerProfileId: string) => {
    setSwitchingLearnerId(learnerProfileId);
    try {
      const res = await fetch('/api/learner-profiles/active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ learnerProfileId }),
      });
      const data = await res.json();
      if (data.success) {
        await refetch();
      }
    } finally {
      setSwitchingLearnerId(null);
    }
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#0a0a0a' }}>
      <TopHeader />

      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 60%,#0d2818 100%)', padding: '32px 24px' }}>
        <div className="dashboard-hero-inner" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Welcome back,</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{firstName}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              {isParentAccount
                ? (isActive ? 'Your learner subscription is active and ready for guided study.' : 'Start a family subscription to unlock classes for your learner.')
                : (isActive ? 'Your subscription is active — keep learning!' : 'Start your free trial to access all courses.')}
            </p>
            {user.active_learner_name && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.3)', color: '#d1fae5', fontSize: 12, fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                Learning as {user.active_learner_name}
              </div>
            )}
          </div>
          <div className="dashboard-hero-stats" style={{ display: 'flex', gap: 24 }}>
            {([['Plan', user.subscription_tier?.replace(/_/g, ' ') || 'Free', '#fff'], ['Access', isActive ? 'Active' : 'None', isActive ? G : '#ef4444']] as [string,string,string][]).map(([label, value, color]) => (
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
        {isParentAccount && (
          <div style={{ marginBottom: 32, background: 'linear-gradient(135deg,#f8fafc,#ecfeff)', border: '1px solid #e5e7eb', borderRadius: 18, padding: '20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: G, marginBottom: 8 }}>Parent dashboard</p>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', marginBottom: 6 }}>Learners under your care</h2>
                <p style={{ fontSize: 14, color: '#6b7280' }}>
                  Use your WhatsApp-linked account to manage access for minors up to Form 6.
                  {user.active_learner_name ? ` ${user.active_learner_name} is the current learner on this device.` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setAddingLearner((current) => !current)}
                  style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: G, background: '#fff', border: '1px solid #d1fae5', borderRadius: 999, cursor: 'pointer' }}
                >
                  {addingLearner ? 'Close learner form' : 'Add learner'}
                </button>
                <Link href="/settings" style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>
                  Manage subscription
                </Link>
              </div>
            </div>
            {addingLearner && (
              <div className="parent-learner-form" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div className="parent-learner-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>Learner full name</label>
                    <input
                      value={parentLearnerForm.full_name}
                      onChange={(e) => setParentLearnerForm((current) => ({ ...current, full_name: e.target.value }))}
                      placeholder="Learner full name"
                      style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#0a0a0a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>Level</label>
                    <select
                      value={parentLearnerForm.education_level}
                      onChange={(e) => {
                        const nextLevel = e.target.value as EducationLevel;
                        const nextMeta = EDUCATION_LEVELS.find((entry) => entry.key === nextLevel);
                        setParentLearnerForm((current) => ({
                          ...current,
                          education_level: nextLevel,
                          sub_category: nextMeta?.sub_categories[0] || '',
                        }));
                      }}
                      style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#0a0a0a', fontSize: 14, outline: 'none' }}
                    >
                      {EDUCATION_LEVELS.filter((entry) => ['primary', 'secondary', 'highschool'].includes(entry.key)).map((entry) => (
                        <option key={entry.key} value={entry.key}>{entry.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>Class</label>
                    <select
                      value={parentLearnerForm.sub_category}
                      onChange={(e) => setParentLearnerForm((current) => ({ ...current, sub_category: e.target.value }))}
                      style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#0a0a0a', fontSize: 14, outline: 'none' }}
                    >
                      {(selectedParentLevel?.sub_categories || []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addLearnerProfile}
                    style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 12, border: 'none', cursor: 'pointer' }}
                  >
                    Save learner
                  </button>
                </div>
              </div>
            )}
            {learnerProfiles.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #d1d5db', borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 6 }}>No learner profiles yet</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Add the first learner from your account after running the parent signup SQL update.</p>
              </div>
            ) : (
              <div className="parent-learner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                {learnerProfiles.map((profile) => (
                  <div key={profile.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0a', marginBottom: 4 }}>{profile.full_name}</p>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                      {LEVELS.find((level) => level.id === profile.education_level)?.label || profile.education_level}
                      {profile.sub_category ? ` · ${profile.sub_category}` : ''}
                    </p>
                    <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: profile.is_minor ? 'rgba(16,185,129,0.1)' : '#f3f4f6', color: profile.is_minor ? '#059669' : '#6b7280' }}>
                      {profile.is_minor ? 'Minor learner' : 'Adult learner'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: profile.id === user.active_learner_profile_id ? G : '#9ca3af' }}>
                        {profile.id === user.active_learner_profile_id ? 'Active on this device' : 'Ready to switch'}
                      </span>
                      <button
                        onClick={() => setActiveLearner(profile.id)}
                        disabled={profile.id === user.active_learner_profile_id || switchingLearnerId === profile.id}
                        style={{
                          padding: '10px 14px',
                          fontSize: 13,
                          fontWeight: 700,
                          color: profile.id === user.active_learner_profile_id ? '#6b7280' : '#fff',
                          background: profile.id === user.active_learner_profile_id ? '#f3f4f6' : G,
                          borderRadius: 10,
                          border: 'none',
                          cursor: profile.id === user.active_learner_profile_id ? 'default' : 'pointer',
                          width: '100%',
                          maxWidth: 170,
                        }}
                      >
                        {switchingLearnerId === profile.id ? 'Switching...' : profile.id === user.active_learner_profile_id ? 'Currently active' : 'Switch learner'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Browse by level</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Choose your education level to find the right courses</p>
            </div>
          </div>
          <div className="level-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {LEVELS.map(level => {
              const hasAccess = isActive && canAccessLevel(user.subscription_tier, level.id as any);
              return (
                <Link key={level.id} href={'/courses?level=' + level.id}
                  className="level-card"
                  style={{ display: 'block', padding: '20px 16px', background: level.bg, borderRadius: 12, textDecoration: 'none', border: '1px solid ' + level.color + '22', position: 'relative' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={level.color} strokeWidth="1.8"><path d={level.icon}/></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a', marginBottom: 3 }}>{level.label}</p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{level.sub}</p>
                  {hasAccess && <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: G }} />}
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Recommended for you</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Courses matched to your level</p>
            </div>
            <Link href="/courses" style={{ fontSize: 13, fontWeight: 600, color: G, textDecoration: 'none' }}>View all</Link>
          </div>
          {fetching ? (
            <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <div style={{ height: 160, background: '#f3f4f6' }} />
                  <div style={{ padding: 14 }}>
                    <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 10, background: '#f3f4f6', borderRadius: 4, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 14, color: '#6b7280' }}>No courses yet. Check back soon.</p>
            </div>
          ) : (
            <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {courses.map(c => (
                <Link key={c.id} href={'/watch/' + c.id}
                  className="course-card"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <Thumb color="#3b82f6" bg="#eff6ff" title={c.title} thumbnailUrl={c.thumbnail_url} />
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#3b82f6' }}>{c.category}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{c.subject}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 6 }}>{c.title}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>{c.instructor_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#f59e0b' }}>★★★★★</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: G }}>
                        {canAccessLevel(user.subscription_tier, c.category) && isActive ? 'Watch now' : 'Free trial'}
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
        @media (max-width: 900px) {
          .level-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .course-grid {
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

          .level-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .level-card {
            padding: 16px 12px !important;
            min-width: 0;
          }

          .course-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 14px !important;
          }

          .course-card {
            min-width: 0;
          }

          .parent-learner-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

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
