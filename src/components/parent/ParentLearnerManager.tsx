'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EDUCATION_LEVELS } from '@/lib/constants';
import type { EducationLevel, ManagedLearnerProfile, User } from '@/types';

const G = '#10B981';
const MINOR_LEVELS: EducationLevel[] = ['primary', 'secondary', 'highschool'];

const LEVEL_META = {
  primary: { label: 'Primary', color: '#2563eb', bg: '#eff6ff' },
  secondary: { label: 'Secondary', color: '#7c3aed', bg: '#f5f3ff' },
  highschool: { label: 'High School', color: '#d97706', bg: '#fffbeb' },
  undergraduate: { label: 'Undergraduate', color: '#059669', bg: '#ecfdf5' },
  masters: { label: 'Masters', color: '#dc2626', bg: '#fef2f2' },
} as const;

type Props = {
  user: User;
  refetchUser: () => Promise<unknown>;
  variant?: 'dashboard' | 'settings';
};

const EMPTY_FORM = {
  full_name: '',
  education_level: 'primary' as EducationLevel,
  sub_category: 'Std 1',
};

export default function ParentLearnerManager({ user, refetchUser, variant = 'dashboard' }: Props) {
  const [profiles, setProfiles] = useState<ManagedLearnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingLearner, setAddingLearner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [switchingLearnerId, setSwitchingLearnerId] = useState<string | null>(null);
  const [editingLearnerId, setEditingLearnerId] = useState<string | null>(null);
  const [deletingLearnerId, setDeletingLearnerId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [learnerForm, setLearnerForm] = useState(EMPTY_FORM);

  const selectedLevel = useMemo(
    () => EDUCATION_LEVELS.find((entry) => entry.key === learnerForm.education_level),
    [learnerForm.education_level]
  );

  const shellStyle = variant === 'dashboard'
    ? { background: 'linear-gradient(135deg,#f8fafc,#ecfeff)', border: '1px solid #e5e7eb', borderRadius: 18, padding: '20px 18px' }
    : { background: '#171717', border: '1px solid #262626', borderRadius: 18, padding: '18px 16px' };
  const cardStyle = variant === 'dashboard'
    ? { background: '#fff', border: '1px solid #e5e7eb' }
    : { background: '#111111', border: '1px solid #262626' };
  const mutedColor = variant === 'dashboard' ? '#6b7280' : '#737373';
  const titleColor = variant === 'dashboard' ? '#0a0a0a' : '#fff';

  async function loadProfiles() {
    setLoading(true);
    const res = await fetch('/api/learner-profiles', { credentials: 'include' });
    const data = await res.json();
    if (data.success) setProfiles(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  function resetForm() {
    setLearnerForm(EMPTY_FORM);
    setEditingLearnerId(null);
    setFormError(null);
  }

  function beginEdit(profile: ManagedLearnerProfile) {
    setAddingLearner(true);
    setEditingLearnerId(profile.id);
    setFormError(null);
    setLearnerForm({
      full_name: profile.full_name,
      education_level: profile.education_level,
      sub_category: profile.sub_category || EDUCATION_LEVELS.find((entry) => entry.key === profile.education_level)?.sub_categories[0] || '',
    });
  }

  async function submitLearner() {
    if (!learnerForm.full_name.trim()) {
      setFormError('Learner full name is required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    setStatusMsg(null);
    const url = editingLearnerId ? `/api/learner-profiles?id=${editingLearnerId}` : '/api/learner-profiles';
    const method = editingLearnerId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(learnerForm),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      setFormError(data.error || 'Could not save learner profile.');
      return;
    }

    await loadProfiles();
    await refetchUser();
    const editing = !!editingLearnerId;
    resetForm();
    setAddingLearner(false);
    setStatusMsg({ ok: true, msg: editing ? 'Learner updated successfully.' : 'Learner added successfully.' });
  }

  async function setActiveLearner(learnerProfileId: string) {
    setSwitchingLearnerId(learnerProfileId);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/learner-profiles/active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ learnerProfileId }),
      });
      const data = await res.json();
      if (data.success) {
        await refetchUser();
        setStatusMsg({ ok: true, msg: `${data.data?.active_learner?.full_name || 'Learner'} is now active on this device.` });
      } else {
        setStatusMsg({ ok: false, msg: data.error || 'Could not switch learner.' });
      }
    } finally {
      setSwitchingLearnerId(null);
    }
  }

  async function deleteLearner(profile: ManagedLearnerProfile) {
    const confirmed = window.confirm(`Remove ${profile.full_name} from this parent account? Their saved progress under this learner profile will be deleted.`);
    if (!confirmed) return;

    setDeletingLearnerId(profile.id);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/learner-profiles?id=${profile.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await loadProfiles();
        await refetchUser();
        if (editingLearnerId === profile.id) {
          resetForm();
          setAddingLearner(false);
        }
        setStatusMsg({ ok: true, msg: `${profile.full_name} was removed.` });
      } else {
        setStatusMsg({ ok: false, msg: data.error || 'Could not remove learner.' });
      }
    } finally {
      setDeletingLearnerId(null);
    }
  }

  return (
    <section style={shellStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: G, marginBottom: 8 }}>Roadmap step 2</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: titleColor, marginBottom: 6 }}>Manage learners</h2>
          <p style={{ fontSize: 14, color: mutedColor, maxWidth: 720 }}>
            Keep each child in a separate learner profile, switch the active learner on this device, and track progress by class before opening lessons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setAddingLearner((current) => {
                const next = !current;
                if (!next) resetForm();
                return next;
              });
            }}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: variant === 'dashboard' ? G : '#0a0a0a', background: variant === 'dashboard' ? '#fff' : '#d1fae5', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 999, cursor: 'pointer' }}
          >
            {addingLearner ? 'Close form' : 'Add learner'}
          </button>
          <Link href="/settings?tab=plans" style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 999, textDecoration: 'none' }}>
            Manage subscription
          </Link>
        </div>
      </div>

      {user.active_learner_name && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', borderRadius: 999, background: variant === 'dashboard' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.26)', color: variant === 'dashboard' ? '#047857' : '#d1fae5', fontSize: 12, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
          Current learner: {user.active_learner_name}
        </div>
      )}

      {statusMsg && (
        <div style={{
          marginBottom: 16,
          borderRadius: 14,
          padding: '12px 14px',
          fontSize: 13,
          fontWeight: 600,
          background: statusMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: statusMsg.ok ? '1px solid rgba(16,185,129,0.24)' : '1px solid rgba(239,68,68,0.24)',
          color: statusMsg.ok ? (variant === 'dashboard' ? '#047857' : '#a7f3d0') : '#fca5a5',
        }}>
          {statusMsg.msg}
        </div>
      )}

      {addingLearner && (
        <div className="parent-learner-manager-form" style={{ ...cardStyle, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div className="parent-learner-manager-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: mutedColor, marginBottom: 6 }}>Learner full name</label>
              <input
                value={learnerForm.full_name}
                onChange={(e) => setLearnerForm((current) => ({ ...current, full_name: e.target.value }))}
                placeholder="Learner full name"
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: variant === 'dashboard' ? '1px solid #e5e7eb' : '1px solid #333', background: variant === 'dashboard' ? '#fff' : '#0a0a0a', color: titleColor, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: mutedColor, marginBottom: 6 }}>Level</label>
              <select
                value={learnerForm.education_level}
                onChange={(e) => {
                  const nextLevel = e.target.value as EducationLevel;
                  const nextMeta = EDUCATION_LEVELS.find((entry) => entry.key === nextLevel);
                  setLearnerForm((current) => ({
                    ...current,
                    education_level: nextLevel,
                    sub_category: nextMeta?.sub_categories[0] || '',
                  }));
                }}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: variant === 'dashboard' ? '1px solid #e5e7eb' : '1px solid #333', background: variant === 'dashboard' ? '#fff' : '#0a0a0a', color: titleColor, fontSize: 14, outline: 'none' }}
              >
                {EDUCATION_LEVELS.filter((entry) => MINOR_LEVELS.includes(entry.key)).map((entry) => (
                  <option key={entry.key} value={entry.key}>{entry.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: mutedColor, marginBottom: 6 }}>Class</label>
              <select
                value={learnerForm.sub_category}
                onChange={(e) => setLearnerForm((current) => ({ ...current, sub_category: e.target.value }))}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: variant === 'dashboard' ? '1px solid #e5e7eb' : '1px solid #333', background: variant === 'dashboard' ? '#fff' : '#0a0a0a', color: titleColor, fontSize: 14, outline: 'none' }}
              >
                {(selectedLevel?.sub_categories || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <button
              onClick={submitLearner}
              disabled={saving}
              style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#fff', background: G, borderRadius: 12, border: 'none', cursor: 'pointer', minHeight: 46 }}
            >
              {saving ? 'Saving...' : editingLearnerId ? 'Save changes' : 'Save learner'}
            </button>
          </div>
          {formError && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{formError}</p>
          )}
        </div>
      )}

      {loading ? (
        <div className="parent-learner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ ...cardStyle, borderRadius: 16, padding: 16, minHeight: 210 }} />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ ...cardStyle, borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: titleColor, marginBottom: 6 }}>No learner profiles yet</p>
          <p style={{ fontSize: 13, color: mutedColor, marginBottom: 14 }}>
            Add the first learner so progress, switching, and subscriptions stay organized per child.
          </p>
          <button
            onClick={() => setAddingLearner(true)}
            style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: G, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Add first learner
          </button>
        </div>
      ) : (
        <div className="parent-learner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          {profiles.map((profile) => {
            const meta = LEVEL_META[profile.education_level] || LEVEL_META.primary;
            return (
              <div key={profile.id} style={{ ...cardStyle, borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: titleColor, marginBottom: 5 }}>{profile.full_name}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      {profile.sub_category && (
                        <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: variant === 'dashboard' ? '#f3f4f6' : '#1f2937', color: variant === 'dashboard' ? '#6b7280' : '#d1d5db' }}>
                          {profile.sub_category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: profile.id === user.active_learner_profile_id ? G : mutedColor }}>
                    {profile.id === user.active_learner_profile_id ? 'Active now' : 'Standby'}
                  </span>
                </div>

                <div className="parent-learner-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                  {[
                    ['Courses', String(profile.stats.enrolled_courses)],
                    ['Done', String(profile.stats.completed_courses)],
                    ['Progress', `${profile.stats.completion_percent}%`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ borderRadius: 12, padding: '10px 8px', background: variant === 'dashboard' ? '#f9fafb' : '#171717', textAlign: 'center' }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: titleColor }}>{value}</p>
                      <p style={{ fontSize: 11, color: mutedColor, marginTop: 3 }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: mutedColor }}>Learning progress</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: titleColor }}>{profile.stats.completion_percent}%</span>
                  </div>
                  <div style={{ height: 9, borderRadius: 999, background: variant === 'dashboard' ? '#e5e7eb' : '#262626', overflow: 'hidden' }}>
                    <div style={{ width: `${profile.stats.completion_percent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10B981,#34d399)' }} />
                  </div>
                  <p style={{ marginTop: 8, fontSize: 11, color: mutedColor }}>
                    {profile.stats.last_activity_at
                      ? `Last activity ${new Date(profile.stats.last_activity_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'No saved class progress yet'}
                  </p>
                </div>

                <div className="parent-learner-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveLearner(profile.id)}
                    disabled={profile.id === user.active_learner_profile_id || switchingLearnerId === profile.id}
                    style={{
                      flex: '1 1 160px',
                      padding: '10px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: profile.id === user.active_learner_profile_id ? mutedColor : '#fff',
                      background: profile.id === user.active_learner_profile_id ? (variant === 'dashboard' ? '#f3f4f6' : '#1f2937') : G,
                      borderRadius: 10,
                      border: 'none',
                      cursor: profile.id === user.active_learner_profile_id ? 'default' : 'pointer',
                    }}
                  >
                    {switchingLearnerId === profile.id ? 'Switching...' : profile.id === user.active_learner_profile_id ? 'Currently active' : 'Switch learner'}
                  </button>
                  <button
                    onClick={() => beginEdit(profile)}
                    style={{ flex: '1 1 112px', padding: '10px 12px', fontSize: 13, fontWeight: 700, color: titleColor, background: 'transparent', borderRadius: 10, border: variant === 'dashboard' ? '1px solid #d1d5db' : '1px solid #333', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLearner(profile)}
                    disabled={deletingLearnerId === profile.id}
                    style={{ flex: '1 1 112px', padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#ef4444', background: 'transparent', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
                  >
                    {deletingLearnerId === profile.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 780px) {
          .parent-learner-manager-form-grid {
            grid-template-columns: 1fr !important;
          }

          .parent-learner-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .parent-learner-actions > button {
            flex: 1 1 100%;
          }
        }

        @media (max-width: 520px) {
          .parent-learner-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
