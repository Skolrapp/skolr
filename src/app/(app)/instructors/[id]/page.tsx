'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';

const G = '#10B981';

export default function InstructorProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructors/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setData(payload.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: G, animation: 'spin 0.8s linear infinite' }} />
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  if (!data?.instructor) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        {user ? <TopHeader /> : null}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0a0a0a', marginBottom: 12 }}>Instructor not found</h1>
          <Link href="/courses" style={{ color: G, fontWeight: 700, textDecoration: 'none' }}>Back to courses</Link>
        </div>
      </div>
    );
  }

  const instructor = data.instructor;
  const courses = data.courses || [];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0a0a0a', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {user ? <TopHeader /> : null}

      <div style={{ background: 'linear-gradient(135deg,#0f172a,#111827 60%,#0f3d2e)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#ecfdf5', border: '3px solid rgba(255,255,255,0.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {instructor.avatar_url
              ? <img src={instructor.avatar_url} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 34, fontWeight: 900, color: G }}>{instructor.name?.charAt(0)}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: G, textTransform: 'uppercase', marginBottom: 8 }}>Instructor profile</p>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>{instructor.name}</h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 700 }}>
              {instructor.bio || 'Experienced educator on Skolr helping students move from introduction to mastery with structured lessons.'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(120px,1fr))', gap: 10 }}>
            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{data.stats?.total_courses || 0}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)' }}>Published classes</p>
            </div>
            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{(data.stats?.total_views || 0).toLocaleString()}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)' }}>Lesson views</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 110px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
          <div style={{ padding: 22, borderRadius: 20, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 10px 24px rgba(15,23,42,0.05)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>About the instructor</h2>
            <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.8, marginBottom: 16 }}>
              {instructor.bio || 'Bio coming soon.'}
            </p>
            {instructor.education && <p style={{ fontSize: 14, color: '#111827', marginBottom: 8 }}><strong>Education:</strong> {instructor.education}</p>}
            {instructor.experience && <p style={{ fontSize: 14, color: '#111827', marginBottom: 8 }}><strong>Experience:</strong> {instructor.experience}</p>}
            {Array.isArray(instructor.specialties) && instructor.specialties.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                {instructor.specialties.map((specialty: string) => (
                  <span key={specialty} style={{ padding: '7px 12px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 12, fontWeight: 700 }}>
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: 22, borderRadius: 20, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Teaching on Skolr</h2>
            <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              Browse this instructor’s classes, then open any one to watch the free introduction before proceeding into the full lesson flow.
            </p>
            <Link href="/courses" style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 999, background: G, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Browse all classes
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Published classes</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Open a class to preview the free introduction and lesson flow.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
            {courses.map((course: any) => (
              <Link key={course.id} href={`/watch/${course.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb', borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' }}>
                <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg,#ecfdf5,#dbeafe)', overflow: 'hidden' }}>
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: G }}>{course.title?.charAt(0)}</div>}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ padding: '4px 8px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 11, fontWeight: 700 }}>{course.category}</span>
                    {course.sub_category && <span style={{ padding: '4px 8px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>{course.sub_category}</span>}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.45, marginBottom: 6 }}>{course.title}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{course.subject}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: G }}>Open class preview</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {user ? <BottomNav role={user.role} /> : null}

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*='grid-template-columns: 1.2fr 0.8fr'] {
            grid-template-columns: 1fr !important;
          }

          div[style*='grid-template-columns: repeat(3,minmax(0,1fr))'] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          div[style*='grid-template-columns: repeat(3,minmax(0,1fr))'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
