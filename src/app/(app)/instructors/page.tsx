import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import TopHeader from '@/components/layout/TopHeader';
import SubtleBackButton from '@/components/ui/SubtleBackButton';
import { getCurrentUser } from '@/lib/auth';
import { FORM_FOUR_CLASS } from '@/lib/launchCatalog';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const G = '#10B981';

type InstructorListItem = {
  id: string;
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
  education?: string | null;
  experience?: string | null;
  courseCount: number;
  subjectCount: number;
  subjects: string[];
};

async function getRealInstructors(): Promise<InstructorListItem[]> {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from('courses')
    .select('id, subject, instructor_id, users!instructor_id(id, name, avatar_url, bio), instructor_profiles!instructor_id(user_id, education, experience)')
    .eq('is_published', true)
    .eq('category', FORM_FOUR_CLASS.level)
    .eq('sub_category', FORM_FOUR_CLASS.subCategory || null)
    .order('created_at', { ascending: false });

  const grouped = new Map<string, InstructorListItem>();

  (data || []).forEach((row: any) => {
    const user = row.users;
    if (!user?.id || !user?.name) return;

    const existing = grouped.get(user.id);
    if (existing) {
      existing.courseCount += 1;
      if (row.subject && !existing.subjects.includes(row.subject)) {
        existing.subjects.push(row.subject);
        existing.subjectCount = existing.subjects.length;
      }
      return;
    }

    const profile = Array.isArray(row.instructor_profiles)
      ? row.instructor_profiles[0]
      : row.instructor_profiles;

    grouped.set(user.id, {
      id: user.id,
      name: user.name,
      avatar_url: user.avatar_url || null,
      bio: user.bio || null,
      education: profile?.education || null,
      experience: profile?.experience || null,
      courseCount: 1,
      subjectCount: row.subject ? 1 : 0,
      subjects: row.subject ? [row.subject] : [],
    });
  });

  return Array.from(grouped.values());
}

export const metadata: Metadata = {
  title: 'Form Four Instructors | Skolr',
  description: 'Meet the real instructors currently visible on the Skolr Form Four public journey.',
};

export default async function InstructorsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sk_token')?.value;
  const user = token ? await getCurrentUser() : null;
  const instructors = await getRealInstructors();

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7f5', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {user ? <TopHeader /> : null}

      <section style={{ background: 'linear-gradient(135deg,#101413 0%,#16251f 54%,#0c7a55 100%)', padding: '34px 24px 52px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ marginBottom: 18 }}>
            <SubtleBackButton fallbackHref="/" label="Back to home" light />
          </div>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9, color: '#a7f3d0', marginBottom: 10 }}>
            Teachers
          </p>
          <h1 style={{ fontSize: 'clamp(36px,5vw,62px)', lineHeight: 1.02, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            Real Form Four instructors on Skolr.
          </h1>
          <p style={{ maxWidth: 720, fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.76)', marginBottom: 0 }}>
            {instructors.length} real instructor{instructors.length === 1 ? '' : 's'} currently visible through published Form Four lessons.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px 90px' }}>
        {instructors.length ? (
          <div className="instructor-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
            {instructors.map((instructor) => (
              <Link
                key={instructor.id}
                href={`/instructors/${instructor.id}`}
                style={{ textDecoration: 'none', color: 'inherit', borderRadius: 24, border: '1px solid #e5e7eb', background: '#fff', padding: 22, boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', background: '#ecfdf5', border: '1px solid #d1fae5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {instructor.avatar_url ? (
                      <img src={instructor.avatar_url} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 28, fontWeight: 900, color: '#047857' }}>{instructor.name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{instructor.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>
                      {instructor.courseCount} published class{instructor.courseCount === 1 ? '' : 'es'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5b6570', margin: 0 }}>
                    <strong>Subjects:</strong> {instructor.subjects.join(', ') || 'Form Four lessons'}
                  </p>
                  {instructor.education && (
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5b6570', margin: 0 }}>
                      <strong>Qualification:</strong> {instructor.education}
                    </p>
                  )}
                  {instructor.experience && (
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5b6570', margin: 0 }}>
                      <strong>Experience:</strong> {instructor.experience}
                    </p>
                  )}
                  {instructor.bio && (
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5b6570', margin: 0 }}>
                      <strong>Teaching philosophy:</strong> {instructor.bio}
                    </p>
                  )}
                </div>

                <p style={{ fontSize: 12, fontWeight: 800, color: G, marginTop: 16 }}>Open instructor profile</p>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ borderRadius: 24, border: '1px dashed #d7ded9', background: '#fff', padding: 24 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>No public instructors are visible yet.</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#64748b' }}>
              Real instructors will appear here automatically once active instructor accounts publish Form Four lessons.
            </p>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 960px) {
          .instructor-list-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .instructor-list-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
