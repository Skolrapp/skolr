'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import TopHeader from '@/components/layout/TopHeader';

const G = '#10B981';
type Tab = 'reviews' | 'tracker' | 'cloning' | 'payments' | 'support';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('reviews');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [overview, setOverview] = useState<any>(null);
  const [trackerLoading, setTrackerLoading] = useState(true);
  const [studentQuery, setStudentQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [paymentQuery, setPaymentQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [cloneForm, setCloneForm] = useState({ sourceCourseId: '', targetSubjects: '', targetSubCategory: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncTabFromUrl = () => {
      const requestedTab = new URLSearchParams(window.location.search).get('tab');
      if (requestedTab === 'reviews' || requestedTab === 'tracker' || requestedTab === 'cloning' || requestedTab === 'payments' || requestedTab === 'support') {
        setTab(requestedTab);
      } else {
        setTab('reviews');
      }
    };

    syncTabFromUrl();
    window.addEventListener('popstate', syncTabFromUrl);
    return () => window.removeEventListener('popstate', syncTabFromUrl);
  }, []);

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    router.replace(`/admin?tab=${nextTab}`);
  };

  useEffect(() => {
    fetch('/api/admin/course-reviews', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTrackerLoading(true);
    fetch('/api/admin/overview', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setOverview(d.data); })
      .finally(() => setTrackerLoading(false));
  }, []);

  const loadStudents = (search = '') => {
    setStudentsLoading(true);
    fetch(`/api/admin/students?q=${encodeURIComponent(search)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudents(d.data); })
      .finally(() => setStudentsLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const loadPayments = (search = paymentQuery, status = paymentStatus) => {
    setPaymentsLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (status) params.set('status', status);
    fetch(`/api/admin/payments?${params.toString()}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setPaymentsData(d.data); })
      .finally(() => setPaymentsLoading(false));
  };

  useEffect(() => {
    loadPayments('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudentDetail = (studentId: string) => {
    setSelectedStudentId(studentId);
    setStudentDetailLoading(true);
    fetch(`/api/admin/students/${studentId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudentDetail(d.data); })
      .finally(() => setStudentDetailLoading(false));
  };

  useEffect(() => {
    setTemplatesLoading(true);
    fetch('/api/admin/course-cloning', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setTemplates(d.data); })
      .finally(() => setTemplatesLoading(false));
  }, []);

  const loadUsers = (search = '') => {
    setUsersLoading(true);
    fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
      })
      .finally(() => setUsersLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const reviewCourse = (id: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/course-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          admin_notes: noteDrafts[id] || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: data.data.status, admin_notes: data.data.admin_notes, reviewed_at: data.data.reviewed_at }
              : item
          )
        );
        setActiveId(null);
        setMessage(action === 'approve' ? 'Course approved and now live.' : 'Course sent back to the instructor.');
      } else {
        setMessage(data.error || 'Review action failed.');
      }
      setTimeout(() => setMessage(''), 4000);
    });
  };

  const patchUser = (id: string, body: Record<string, unknown>, successText: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((current) => current.map((item) => item.id === id ? data.data : item));
        if (body.password) setTempPasswords((current) => ({ ...current, [id]: '' }));
        setMessage(successText);
      } else {
        setMessage(data.error || 'User update failed.');
      }
      setTimeout(() => setMessage(''), 4000);
    });
  };

  const cloneTemplate = () => {
    startTransition(async () => {
      const targetSubjects = cloneForm.targetSubjects
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/course-cloning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceCourseId: cloneForm.sourceCourseId,
          targetSubjects,
          targetSubCategory: cloneForm.targetSubCategory || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Template cloned.');
        setCloneForm({ sourceCourseId: '', targetSubjects: '', targetSubCategory: '' });
      } else {
        setMessage(data.error || 'Template cloning failed.');
      }
      setTimeout(() => setMessage(''), 4000);
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <TopHeader />
      <div className="page animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#fff' }}>Admin control center</h1>
            <p className="text-xs mt-1" style={{ color: '#737373' }}>Review submitted courses and handle account support from one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/courses')}
              className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={{ background: '#1a1a1a', color: '#fff', borderColor: '#222' }}
            >
              Open course catalog
            </button>
            <div className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: G }}>
              Admin
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {([
            ['reviews', 'Review queue'],
            ['tracker', 'Scholar tracker'],
            ['cloning', 'Course cloning'],
            ['payments', 'Payments'],
            ['support', 'User support'],
          ] as Array<[Tab, string]>).map(([id, label]) => (
            <button
              key={id}
              onClick={() => selectTab(id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border !min-h-0 !min-w-0 transition-all"
              style={tab === id ? { background: G, color: '#000', borderColor: G } : { background: '#1a1a1a', color: '#737373', borderColor: '#222' }}
            >
              {label}
            </button>
          ))}
        </div>

        {message && (
          <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
            {message}
          </div>
        )}

        <div className="card mb-4">
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>Where to find "View as user"</p>
          <p className="text-xs mt-1" style={{ color: '#737373' }}>
            Open <span style={{ color: '#fff' }}>User support</span>, search for the account, then use <span style={{ color: '#fff' }}>View as user</span> next to reset password.
          </p>
        </div>

        {tab === 'tracker' && (
          <div className="space-y-4">
            {trackerLoading ? (
              <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="skel h-24 rounded-2xl" />)}</div>
            ) : overview ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Students', overview.metrics.total_students],
                    ['Pending Reviews', overview.metrics.pending_reviews],
                    ['Published Courses', overview.metrics.published_courses],
                    ['Monthly Revenue (TZS)', overview.metrics.monthly_revenue.toLocaleString('en-TZ')],
                  ].map(([label, value]) => (
                    <div key={label} className="card">
                      <p className="text-xs" style={{ color: '#737373' }}>{label}</p>
                      <p className="text-xl font-bold mt-2" style={{ color: '#fff' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <h2 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Recent platform activity</h2>
                  <div className="space-y-3">
                    {overview.recent_activity.map((item: any, index: number) => (
                      <div key={`${item.type}-${index}`} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: item.type === 'review' ? '#fbbf24' : item.type === 'completion' ? G : '#60a5fa' }} />
                        <div>
                          <p className="text-sm" style={{ color: '#fff' }}>{item.label}</p>
                          <p className="text-xs mt-1" style={{ color: '#737373' }}>{new Date(item.timestamp).toLocaleString('en-GB')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Top active subjects</h2>
                  <div className="space-y-2">
                    {overview.top_subjects.map((item: any) => (
                      <div key={item.subject} className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: '#fff' }}>{item.subject}</p>
                        <p className="text-xs font-semibold" style={{ color: G }}>{item.count} course{item.count === 1 ? '' : 's'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <div className="card">
              <div className="flex gap-2">
                <input className="inp" placeholder="Search student by name or phone" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} />
                <button className="btn-primary w-auto px-4 text-sm" onClick={() => loadStudents(studentQuery)}>Search</button>
              </div>
            </div>

            {studentsLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skel h-36 rounded-2xl" />)}</div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#fff' }}>{student.name}</p>
                        <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>{student.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#737373' }}>Overall progress</p>
                        <p className="text-lg font-bold" style={{ color: G }}>{student.overall_progress}%</p>
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#737373' }}>
                      {student.active_subjects} active subjects • {student.completed_courses} completed courses
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {student.progress_by_subject.slice(0, 8).map((subject: any) => (
                        <div key={subject.subject} className="rounded-xl p-2" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                          <p className="text-xs" style={{ color: '#a3a3a3' }}>{subject.subject}</p>
                          <p className="text-sm font-semibold mt-1" style={{ color: '#fff' }}>{subject.completion_percent}%</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        className="btn-secondary w-auto px-4 text-sm"
                        onClick={() => loadStudentDetail(student.id)}
                      >
                        {selectedStudentId === student.id ? 'Refresh learner details' : 'View learner details'}
                      </button>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="card">
                    <p className="text-sm font-semibold" style={{ color: '#fff' }}>No students found.</p>
                  </div>
                )}
              </div>
            )}

            {(studentDetailLoading || studentDetail) && (
              <div className="card">
                {studentDetailLoading ? (
                  <div className="space-y-3">
                    <div className="skel h-8 rounded-xl" />
                    <div className="skel h-32 rounded-2xl" />
                    <div className="skel h-40 rounded-2xl" />
                  </div>
                ) : studentDetail ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#fff' }}>{studentDetail.name}</p>
                        <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>{studentDetail.phone}</p>
                        <p className="text-xs mt-1" style={{ color: '#737373' }}>
                          Joined {new Date(studentDetail.created_at).toLocaleDateString('en-GB')} • Tier {studentDetail.subscription_tier}
                        </p>
                      </div>
                      <button
                        className="btn-secondary w-auto px-4 text-sm"
                        onClick={() => {
                          setSelectedStudentId(null);
                          setStudentDetail(null);
                        }}
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Enrollments', studentDetail.total_enrollments],
                        ['Completed courses', studentDetail.completed_courses],
                        ['Subjects tracked', studentDetail.progress_by_subject.length],
                        ['Last seen', studentDetail.last_seen_at ? new Date(studentDetail.last_seen_at).toLocaleString('en-GB') : 'No session'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl p-3" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                          <p className="text-xs" style={{ color: '#737373' }}>{label}</p>
                          <p className="text-sm font-semibold mt-2" style={{ color: '#fff' }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Subject progress snapshot</h3>
                      <div className="space-y-2">
                        {studentDetail.progress_by_subject.length === 0 ? (
                          <p className="text-xs" style={{ color: '#737373' }}>No subject progress yet.</p>
                        ) : studentDetail.progress_by_subject.map((subject: any) => (
                          <div key={subject.subject} className="rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold" style={{ color: '#fff' }}>{subject.subject}</p>
                              <p className="text-xs font-semibold" style={{ color: G }}>{subject.completion_percent}%</p>
                            </div>
                            <div className="mt-2 h-2 rounded-full" style={{ background: '#262626' }}>
                              <div className="h-2 rounded-full" style={{ width: `${subject.completion_percent}%`, background: G }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Recent course activity</h3>
                      <div className="space-y-2">
                        {studentDetail.recent_courses.length === 0 ? (
                          <p className="text-xs" style={{ color: '#737373' }}>No course activity yet.</p>
                        ) : studentDetail.recent_courses.map((entry: any) => (
                          <div key={`${entry.course_id}-${entry.enrolled_at}`} className="rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#fff' }}>{entry.title}</p>
                                <p className="text-xs mt-1" style={{ color: '#737373' }}>
                                  {entry.subject} • {entry.category}{entry.sub_category ? ` • ${entry.sub_category}` : ''}
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>
                                  Enrolled {new Date(entry.enrolled_at).toLocaleDateString('en-GB')}
                                  {entry.completed_at ? ` • Completed ${new Date(entry.completed_at).toLocaleDateString('en-GB')}` : ''}
                                </p>
                              </div>
                              <p className="text-xs font-semibold" style={{ color: entry.completed ? G : '#fbbf24' }}>
                                {entry.completed ? 'Completed' : `${entry.completion_percent}% done`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Recent learner activity</h3>
                      <div className="space-y-2">
                        {studentDetail.recent_activity.length === 0 ? (
                          <p className="text-xs" style={{ color: '#737373' }}>No recent activity.</p>
                        ) : studentDetail.recent_activity.map((item: any, index: number) => (
                          <div key={`${item.type}-${index}`} className="flex items-start gap-3 rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                            <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: item.type === 'completion' ? G : item.type === 'login' ? '#60a5fa' : '#fbbf24' }} />
                            <div>
                              <p className="text-sm" style={{ color: '#fff' }}>{item.label}</p>
                              <p className="text-xs mt-1" style={{ color: '#737373' }}>{new Date(item.timestamp).toLocaleString('en-GB')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {tab === 'cloning' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-sm font-bold mb-2" style={{ color: '#fff' }}>Bulk subject uploader</h2>
              <p className="text-xs mb-4" style={{ color: '#737373' }}>
                Build one strong template course, then clone its structure, chapter layout, and resources into the other Grade 8 subjects.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="lbl">Template course</label>
                  <select className="sel" value={cloneForm.sourceCourseId} onChange={(e) => setCloneForm((current) => ({ ...current, sourceCourseId: e.target.value }))}>
                    <option value="">Select a source template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} • {template.subject} • {template.instructor_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl">Target subjects</label>
                  <textarea
                    className="inp resize-none"
                    rows={8}
                    placeholder={'Physics\nChemistry\nBiology\nKiswahili'}
                    value={cloneForm.targetSubjects}
                    onChange={(e) => setCloneForm((current) => ({ ...current, targetSubjects: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="lbl">Override class/form - optional</label>
                  <input className="inp" placeholder="e.g. Form 2" value={cloneForm.targetSubCategory} onChange={(e) => setCloneForm((current) => ({ ...current, targetSubCategory: e.target.value }))} />
                </div>
                <button className="btn-primary text-sm py-3" disabled={pending || templatesLoading} onClick={cloneTemplate}>
                  {pending ? 'Cloning...' : 'Clone curriculum to target subjects'}
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Template library</h2>
              {templatesLoading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skel h-14 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-2">
                  {templates.slice(0, 8).map((template) => (
                    <div key={template.id} className="rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                      <p className="text-sm font-semibold" style={{ color: '#fff' }}>{template.title}</p>
                      <p className="text-xs mt-1" style={{ color: '#737373' }}>
                        {template.subject} • {template.category}{template.sub_category ? ` • ${template.sub_category}` : ''} • {template.instructor_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex gap-2 flex-wrap">
                <input
                  className="inp"
                  placeholder="Search by learner, phone, or transaction ref"
                  value={paymentQuery}
                  onChange={(e) => setPaymentQuery(e.target.value)}
                />
                <select className="sel w-auto min-w-[150px]" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button className="btn-primary w-auto px-4 text-sm" onClick={() => loadPayments(paymentQuery, paymentStatus)}>Search</button>
              </div>
              <p className="text-xs mt-2" style={{ color: '#737373' }}>
                Monitor mobile money and card transactions, then use the status and provider reference to troubleshoot payment problems quickly.
              </p>
            </div>

            {paymentsLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skel h-24 rounded-2xl" />)}</div>
            ) : paymentsData ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Transactions', paymentsData.summary.total_count],
                    ['Total amount (TZS)', paymentsData.summary.total_amount.toLocaleString('en-TZ')],
                    ['Successful', paymentsData.summary.success_count],
                    ['Pending / Failed', `${paymentsData.summary.pending_count} / ${paymentsData.summary.failed_count}`],
                  ].map(([label, value]) => (
                    <div key={label} className="card">
                      <p className="text-xs" style={{ color: '#737373' }}>{label}</p>
                      <p className="text-xl font-bold mt-2" style={{ color: '#fff' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {paymentsData.transactions.length === 0 ? (
                    <div className="card">
                      <p className="text-sm font-semibold" style={{ color: '#fff' }}>No transactions found.</p>
                    </div>
                  ) : paymentsData.transactions.map((entry: any) => (
                    <div key={entry.id} className="card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#fff' }}>{entry.users?.name || 'Unknown learner'}</p>
                          <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>{entry.users?.phone || entry.msisdn || 'No phone'}</p>
                          <p className="text-xs mt-1" style={{ color: '#737373' }}>
                            {entry.provider?.toUpperCase()} • {entry.subscription_tier} • {entry.billing_cycle}
                          </p>
                          <p className="text-xs mt-1 font-mono" style={{ color: '#a3a3a3' }}>
                            Ref: {entry.provider_reference || 'N/A'}
                          </p>
                          <p className="text-xs mt-1" style={{ color: '#737373' }}>
                            Created {new Date(entry.created_at).toLocaleString('en-GB')}
                            {entry.settled_at ? ` • Settled ${new Date(entry.settled_at).toLocaleString('en-GB')}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#fff' }}>TZS {entry.amount.toLocaleString('en-TZ')}</p>
                          <p
                            className="text-xs font-semibold mt-1"
                            style={{
                              color: entry.status === 'success' ? G : entry.status === 'pending' ? '#fbbf24' : entry.status === 'failed' ? '#f87171' : '#93c5fd',
                            }}
                          >
                            {entry.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}

        {tab === 'reviews' && (
          loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skel h-28 rounded-2xl" />)}</div>
          ) : items.length === 0 ? (
            <div className="card">
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>No submissions waiting.</p>
              <p className="text-xs mt-1" style={{ color: '#737373' }}>Instructors will appear here after they submit a course for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const course = item.courses;
                const instructor = item.users;
                const isPending = item.status === 'pending';

                return (
                  <div key={item.id} className="card">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                        {course?.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: '#525252' }}>SK</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold" style={{ color: '#fff' }}>{course?.title || 'Untitled course'}</p>
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: isPending ? 'rgba(251,191,36,0.12)' : item.status === 'approved' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: isPending ? '#fbbf24' : item.status === 'approved' ? G : '#f87171' }}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#737373' }}>
                          {course?.subject} • {course?.category}{course?.sub_category ? ` • ${course.sub_category}` : ''}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>
                          Instructor: {instructor?.name || 'Unknown'}{instructor?.phone ? ` • ${instructor.phone}` : ''}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#525252' }}>
                          Submitted: {new Date(item.submitted_at).toLocaleString('en-GB')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        className="text-xs font-semibold"
                        style={{ color: G }}
                        onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                      >
                        {activeId === item.id ? 'Hide review notes' : 'Open review notes'}
                      </button>
                    </div>

                    {activeId === item.id && (
                      <div className="mt-4 space-y-3">
                        <textarea
                          className="inp resize-none"
                          rows={4}
                          placeholder="Leave feedback for the instructor..."
                          value={noteDrafts[item.id] ?? item.admin_notes ?? ''}
                          onChange={(e) => setNoteDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                        />
                        {isPending && (
                          <div className="flex gap-2">
                            <button className="btn-primary text-sm py-2.5 flex-1" disabled={pending} onClick={() => reviewCourse(item.id, 'approve')}>
                              {pending ? 'Working...' : 'Approve and publish'}
                            </button>
                            <button className="btn-secondary text-sm py-2.5 flex-1" disabled={pending} onClick={() => reviewCourse(item.id, 'reject')}>
                              Request changes
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'support' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex gap-2">
                <input
                  className="inp"
                  placeholder="Search by name or phone"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn-primary w-auto px-4 text-sm" onClick={() => loadUsers(query)}>Search</button>
              </div>
              <p className="text-xs mt-2" style={{ color: '#737373' }}>
                Use this to troubleshoot login issues, disable accounts, promote admins, or set a temporary password.
              </p>
            </div>

            {usersLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skel h-32 rounded-2xl" />)}</div>
            ) : (
              <div className="space-y-4">
                {users.map((account) => (
                  <div key={account.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#fff' }}>{account.name}</p>
                        <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>{account.phone}</p>
                        <p className="text-xs mt-1" style={{ color: '#737373' }}>
                          Role: {account.role} • {account.is_active ? 'Active' : 'Disabled'}
                        </p>
                      </div>
                      <div className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                        {account.subscription_tier}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm py-2 flex-1" onClick={() => patchUser(account.id, { role: 'admin' }, 'User promoted to admin.')}>Make admin</button>
                        <button className="btn-secondary text-sm py-2 flex-1" onClick={() => patchUser(account.id, { role: 'instructor' }, 'User changed to instructor.')}>Make instructor</button>
                        <button className="btn-secondary text-sm py-2 flex-1" onClick={() => patchUser(account.id, { role: 'student' }, 'User changed to student.')}>Make student</button>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm py-2 flex-1" onClick={() => patchUser(account.id, { is_active: !account.is_active }, account.is_active ? 'Account disabled.' : 'Account re-enabled.')}>
                          {account.is_active ? 'Disable account' : 'Enable account'}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="inp"
                          placeholder="Temporary password"
                          value={tempPasswords[account.id] || ''}
                          onChange={(e) => setTempPasswords((current) => ({ ...current, [account.id]: e.target.value }))}
                        />
                        <button
                          className="btn-primary w-auto px-4 text-sm"
                          onClick={() => patchUser(account.id, { password: tempPasswords[account.id] || '' }, 'Temporary password updated.')}
                        >
                          Reset password
                        </button>
                        <button
                          className="btn-secondary w-auto px-4 text-sm"
                          onClick={async () => {
                            const res = await fetch('/api/admin/impersonation/start', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ userId: account.id }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              window.location.href = '/dashboard';
                            } else {
                              setMessage(data.error || 'Could not start impersonation.');
                              setTimeout(() => setMessage(''), 4000);
                            }
                          }}
                        >
                          View as user
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="card">
                    <p className="text-sm font-semibold" style={{ color: '#fff' }}>No users found.</p>
                    <p className="text-xs mt-1" style={{ color: '#737373' }}>Try a phone number or name search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav role="admin" adminTab={tab} />
    </div>
  );
}
