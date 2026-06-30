'use client';
export const dynamic = 'force-dynamic';
import { useState, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopHeader from '@/components/layout/TopHeader';
import PublicTopNav from '@/components/public/PublicTopNav';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import SubtleBackButton from '@/components/ui/SubtleBackButton';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import { EDUCATION_LEVELS } from '@/lib/constants';
import { FORM_FOUR_CLASS, FORM_FOUR_PRICE_TZS, FORM_FOUR_SUBJECTS } from '@/lib/launchCatalog';
import type { Course, EducationLevel, SubCategory } from '@/types';

const G = '#10B981';
const COURSES_CACHE_PREFIX = 'skolr:courses:';
const coursesQueryCache = new Map<string, { items: Course[]; total: number }>();
const LEVELS = [
  { id: '',              label: 'All Levels',    color: '#6b7280', bg: '#f9fafb' },
  { id: 'primary',       label: 'Primary',       color: '#3b82f6', bg: '#eff6ff', sub: 'Std 1-7' },
  { id: 'secondary',     label: 'Secondary',     color: '#8b5cf6', bg: '#f5f3ff', sub: 'Form 1-4' },
  { id: 'highschool',    label: 'High School',   color: '#f59e0b', bg: '#fffbeb', sub: 'Form 5-6' },
  { id: 'undergraduate', label: 'Undergraduate', color: '#10b981', bg: '#ecfdf5', sub: 'Year 1-3' },
  { id: 'masters',       label: 'Masters',       color: '#ef4444', bg: '#fef2f2', sub: 'Postgraduate' },
];
const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Geography','History','Kiswahili','English','Commerce','ICT'];
const SORT_OPTIONS = [{id:'popular',label:'Most popular'},{id:'newest',label:'Newest first'},{id:'rating',label:'Highest rated'}];

function Thumb({color,bg,title,thumbnailUrl}:{color:string;bg:string;title:string;thumbnailUrl?:string|null}){
  return(
    <div style={{width:'100%',aspectRatio:'16/9',background:'linear-gradient(135deg,'+bg+','+color+'22)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
      ) : (
        <>
          <div style={{position:'absolute',top:-12,right:-12,width:70,height:70,borderRadius:'50%',background:color+'18'}}/>
          <div style={{width:38,height:38,borderRadius:9,background:color,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
            <span style={{color:'#fff',fontSize:15,fontWeight:800}}>{title.charAt(0)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function CoursesContent(){
  const {user}=useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const sp=useSearchParams();
  const [level,setLevel]=useState<EducationLevel|''>((sp.get('level') as EducationLevel)||'');
  const [sub,setSub]=useState<SubCategory | ''>((sp.get('sub') as SubCategory) || '');
  const [subject,setSubject]=useState(sp.get('subject')||'');
  const [sort,setSort]=useState('popular');
  const [courses,setCourses]=useState<Course[]>([]);
  const [total,setTotal]=useState(0);
  const [page,setPage]=useState(1);
  const [fetching,setFetching]=useState(true);
  const PER=9;
  const isLaunchRoute = level === FORM_FOUR_CLASS.level && sub === (FORM_FOUR_CLASS.subCategory || '');
  const isPublicLaunchView = !user || isLaunchRoute;
  const launchSubjects = FORM_FOUR_SUBJECTS.map((entry) => entry.catalogSubject);

  useEffect(() => {
    if (user?.role === 'instructor') {
      router.replace('/instructor');
    }
  }, [router, user?.role]);

  if (user?.role === 'instructor') {
    return null;
  }

  useEffect(() => {
    if (!isPublicLaunchView && !(!user && !level && !sub)) return;
    if (level !== FORM_FOUR_CLASS.level) setLevel(FORM_FOUR_CLASS.level as EducationLevel);
    if (sub !== (FORM_FOUR_CLASS.subCategory || '')) setSub((FORM_FOUR_CLASS.subCategory || '') as SubCategory);
    if (page !== 1) setPage(1);
  }, [isPublicLaunchView, level, page, sub, user]);

  const fetchCourses=useCallback(()=>{
    const params=new URLSearchParams();
    if(level)params.set('level',level);
    if(sub)params.set('sub',sub);
    if(subject)params.set('subject',subject);
    if(isPublicLaunchView)params.set('launch_only','1');
    params.set('per_page',String(PER));
    params.set('page',String(page));
    const cacheKey = params.toString();
    const memoryCached = coursesQueryCache.get(cacheKey);

    if (memoryCached) {
      setCourses(memoryCached.items);
      setTotal(memoryCached.total);
      setFetching(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const sessionCached = window.sessionStorage.getItem(COURSES_CACHE_PREFIX + cacheKey);
      if (sessionCached) {
        try {
          const parsed = JSON.parse(sessionCached) as { items: Course[]; total: number };
          coursesQueryCache.set(cacheKey, parsed);
          setCourses(parsed.items);
          setTotal(parsed.total);
          setFetching(false);
          return;
        } catch {}
      }
    }

    setFetching(true);
    fetch('/api/courses?'+cacheKey,{credentials:'include'})
      .then(r=>r.json())
      .then(d=>{
        if(d.success){
          const payload = { items: d.data.items, total: d.data.total||d.data.items.length };
          coursesQueryCache.set(cacheKey, payload);
          setCourses(payload.items);
          setTotal(payload.total);
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(COURSES_CACHE_PREFIX + cacheKey, JSON.stringify(payload));
          }
        }
      })
      .finally(()=>setFetching(false));
  },[isPublicLaunchView, level,sub,subject,page]);

  useEffect(()=>{fetchCourses();},[fetchCourses]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (sub) params.set('sub', sub);
    if (subject) params.set('subject', subject);
    if (page > 1) params.set('page', String(page));
    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, '', next);
  }, [pathname, level, sub, subject, page]);

  const currentLevel=LEVELS.find(l=>l.id===level)||LEVELS[0];
  const isActive=isSubscriptionActive(user?.subscription_expires_at);
  const totalPages=Math.ceil(total/PER);
  const sortLabel = SORT_OPTIONS.find((option) => option.id === sort)?.label || 'Most popular';
  const levelMeta = level ? EDUCATION_LEVELS.find((entry) => entry.key === level) : null;
  const visibleLevels = isPublicLaunchView
    ? [{ id: FORM_FOUR_CLASS.level, label: 'Form Four', color: '#10B981', bg: '#ecfdf5', sub: FORM_FOUR_CLASS.subCategory || 'Launch focus' }]
    : LEVELS;
  const visibleSubjects = isPublicLaunchView ? launchSubjects : SUBJECTS;
  const launchSubjectCounts = FORM_FOUR_SUBJECTS.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.catalogSubject] = courses.filter((course) => course.subject === entry.catalogSubject).length;
    return acc;
  }, {});
  const guestNeedsClassChoice = !isPublicLaunchView && !user && !!level && !sub;
  const guestHeaderCopy = isPublicLaunchView
    ? 'Premium Form Four exam preparation with subject-by-subject lesson previews before full monthly access.'
    : levelMeta
      ? `Choose a class first, then preview real lessons before signing up.`
      : 'Choose a level to explore classes, chapters, and preview lessons before signing up.';
  const currentLabel = isPublicLaunchView ? 'Form Four subjects' : currentLevel.label === 'All Levels' ? 'All Courses' : currentLevel.label + ' Courses';

  return(
    <div style={{background:'#fff',minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0a0a0a'}}>
      {user ? <TopHeader /> : <PublicTopNav />}

      <div className="courses-hero" style={{background:isPublicLaunchView?'linear-gradient(135deg,#121212 0%,#16251f 58%,#0d7c55 100%)':level?'linear-gradient(135deg,'+(currentLevel as any).color+'dd,'+(currentLevel as any).color+'aa)':'linear-gradient(135deg,#0a0a0a,#1a1a2e)',padding:'34px 24px 30px'}}>
        <div className="courses-hero-inner" style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{maxWidth:isPublicLaunchView?720:undefined}}>
            <div style={{marginBottom:16}}>
              <SubtleBackButton
                fallbackHref={user ? '/dashboard' : '/'}
                label={user ? 'Back' : 'Back to home'}
                light
              />
            </div>
            {isPublicLaunchView && (
              <p style={{fontSize:12,fontWeight:800,letterSpacing:0.9,textTransform:'uppercase',color:'#86efac',marginBottom:10}}>Form Four launch focus</p>
            )}
            <h1 style={{fontSize:24,fontWeight:800,color:'#fff',marginBottom:6}}>{currentLabel}</h1>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.65)',marginBottom:12}}>
              {!user ? guestHeaderCopy : `${(currentLevel as any).sub||'Form Four focus'} · ${total} courses`}
            </p>
            {!isPublicLaunchView && (
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {visibleLevels.map(l=>(
                  <button key={l.id} onClick={()=>{if (!isPublicLaunchView) { setLevel(l.id as EducationLevel);setSub('');setPage(1);} }}
                    style={{padding:'4px 12px',fontSize:11,fontWeight:600,borderRadius:999,border:'none',background:level===l.id?'#fff':'rgba(255,255,255,0.18)',color:level===l.id?'#0a0a0a':'#fff',cursor:'pointer'}}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="courses-hero-stats" style={{display:'flex',gap:20}}>
            {(isPublicLaunchView
              ? [['Subjects', String(FORM_FOUR_SUBJECTS.length)], ['Access', `${FORM_FOUR_PRICE_TZS.toLocaleString()} TZS`], ['Preview', 'Guest Ready']]
              : [['Courses',String(total)],['Subjects','12'],['Students','8.4K']]).map(([lbl,val])=>(
              <div className="courses-hero-stat-card" key={lbl} style={{textAlign:'center',padding:isPublicLaunchView?'14px 16px':'0',borderRadius:isPublicLaunchView?18:0,background:isPublicLaunchView?'rgba(255,255,255,0.08)':'transparent',border:isPublicLaunchView?'1px solid rgba(255,255,255,0.12)':'none',minWidth:isPublicLaunchView?128:0}}>
                <p style={{fontSize:20,fontWeight:800,color:'#fff'}}>{val}</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="courses-shell" style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:0,padding:'0 24px',alignItems:'flex-start'}}>
        <aside className="courses-sidebar" style={{width:isPublicLaunchView?0:220,display:isPublicLaunchView?'none':'block',flexShrink:0,paddingTop:24,paddingRight:24,borderRight:'1px solid #e5e7eb',minHeight:600}}>
          <div style={{marginBottom:24}}>
            <p style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Subject</p>
            <button onClick={()=>setSubject('')} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'6px 8px',borderRadius:7,border:'none',background:!subject?'#ecfdf5':'transparent',color:!subject?'#059669':'#6b7280',fontSize:12,fontWeight:!subject?700:400,cursor:'pointer',textAlign:'left',marginBottom:2}}>
              <div style={{width:7,height:7,borderRadius:2,background:!subject?G:'#e5e7eb',flexShrink:0}}/>All subjects
            </button>
            {visibleSubjects.map(s=>(
              <button key={s} onClick={()=>setSubject(subject===s?'':s)} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'6px 8px',borderRadius:7,border:'none',background:subject===s?'#ecfdf5':'transparent',color:subject===s?'#059669':'#6b7280',fontSize:12,fontWeight:subject===s?700:400,cursor:'pointer',textAlign:'left',marginBottom:2}}>
                <div style={{width:7,height:7,borderRadius:2,background:subject===s?G:'#e5e7eb',flexShrink:0}}/>{s}
              </button>
            ))}
          </div>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Sort by</p>
            {SORT_OPTIONS.map(o=>(
              <button key={o.id} onClick={()=>setSort(o.id)} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'6px 8px',borderRadius:7,border:'none',background:sort===o.id?'#ecfdf5':'transparent',color:sort===o.id?'#059669':'#6b7280',fontSize:12,fontWeight:sort===o.id?700:400,cursor:'pointer',textAlign:'left',marginBottom:2}}>
                <div style={{width:7,height:7,borderRadius:2,background:sort===o.id?G:'#e5e7eb',flexShrink:0}}/>{o.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="courses-main" style={{flex:1,paddingTop:24,paddingLeft:24,minWidth:0}}>
          {isPublicLaunchView && (
            <div className="courses-launch-panel" style={{marginBottom:18,padding:'18px 18px 16px',border:'1px solid #e5e7eb',borderRadius:20,background:'linear-gradient(180deg,#ffffff 0%,#f7fbf9 100%)',boxShadow:'0 16px 40px rgba(15,23,42,0.05)'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:14}}>
                <div style={{maxWidth:620}}>
                  <p style={{fontSize:12,fontWeight:800,letterSpacing:0.8,textTransform:'uppercase',color:'#047857',marginBottom:8}}>Launch roadmap</p>
                  <h2 style={{fontSize:22,fontWeight:900,color:'#111827',marginBottom:0}}>Choose where to start.</h2>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:12,fontWeight:800,padding:'8px 12px',borderRadius:999,background:'#ecfdf5',color:'#047857'}}>Form 4 live now</span>
                  <span style={{fontSize:12,fontWeight:800,padding:'8px 12px',borderRadius:999,background:'#f3f4f6',color:'#374151'}}>Guest preview enabled</span>
                </div>
              </div>
              <div style={{maxWidth:620,marginBottom:12}}>
                <p style={{fontSize:12,fontWeight:800,letterSpacing:0.8,textTransform:'uppercase',color:'#047857',marginBottom:8}}>Browse by subject</p>
                <p style={{fontSize:14,lineHeight:1.7,color:'#6b7280'}}>Choose a Form Four subject to preview available lessons, inspect the instructor, and decide whether to continue into the free trial flow.</p>
              </div>
              <div className="courses-launch-subjects" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12}}>
                {FORM_FOUR_SUBJECTS.map((entry) => {
                  const active = subject === entry.catalogSubject;
                  const lessonCount = launchSubjectCounts[entry.catalogSubject] || 0;
                  return (
                    <Link
                      key={entry.id}
                      href={entry.href}
                      style={{
                        display:'block',
                        padding:'14px 14px 12px',
                        borderRadius:16,
                        border:'1px solid ' + (active ? '#10B981' : '#e5e7eb'),
                        background:active ? '#ecfdf5' : '#fff',
                        textAlign:'left',
                        textDecoration:'none'
                      }}
                    >
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:8}}>
                        <p style={{fontSize:13,fontWeight:900,color:active ? '#047857' : '#0f172a'}}>{entry.name}</p>
                        <span style={{fontSize:10,fontWeight:800,padding:'5px 8px',borderRadius:999,background:active ? '#d1fae5' : '#f3f4f6',color:active ? '#047857' : '#6b7280'}}>Form Four</span>
                      </div>
                      <p style={{fontSize:12,lineHeight:1.6,color:active ? '#059669' : '#6b7280',marginBottom:10}}>{entry.confidenceLine}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
                        <span style={{fontSize:11,color:active ? '#047857' : '#6b7280',fontWeight:700}}>
                          {lessonCount ? `${lessonCount} lesson${lessonCount === 1 ? '' : 's'} ready` : 'Lessons coming soon'}
                        </span>
                        <span style={{fontSize:11,fontWeight:800,color:'#111827'}}>
                          {lessonCount ? 'Preview lesson' : 'Start learning'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <div className="courses-mobile-toolbar" style={{display:'none',marginBottom:16}}>
            <div className="courses-mobile-pills" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:11,fontWeight:700,padding:'6px 10px',borderRadius:999,background:'#eff6ff',color:'#2563eb'}}>
                {sub || (isPublicLaunchView ? 'Form 4' : 'Choose class')}
              </span>
              <span style={{fontSize:11,fontWeight:700,padding:'6px 10px',borderRadius:999,background:'#ecfdf5',color:'#059669'}}>
                {subject || 'All subjects'}
              </span>
              <span style={{fontSize:11,fontWeight:700,padding:'6px 10px',borderRadius:999,background:'#f3f4f6',color:'#6b7280'}}>
                {sortLabel}
              </span>
            </div>
          </div>
          {!isPublicLaunchView && <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16,scrollbarWidth:'none'}}>
            {visibleLevels.map(l=>(
              <button key={l.id} onClick={()=>{if (!isPublicLaunchView) { setLevel(l.id as EducationLevel);setSub('');setPage(1);} }}
                style={{padding:'6px 14px',fontSize:11,fontWeight:600,borderRadius:999,border:'1.5px solid '+(level===l.id?'#0a0a0a':'#e5e7eb'),background:level===l.id?'#0a0a0a':'#fff',color:level===l.id?'#fff':'#6b7280',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                {l.label}
              </button>
            ))}
          </div>}
          {levelMeta && !isPublicLaunchView && (
            <div style={{marginBottom:20,padding:'18px 18px 16px',background:guestNeedsClassChoice ? '#f8fafc' : '#fff',border:'1px solid #e5e7eb',borderRadius:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:12}}>
                <div>
                  <p style={{fontSize:15,fontWeight:800,color:'#0a0a0a',marginBottom:4}}>
                    {guestNeedsClassChoice ? `Pick a ${levelMeta.key === 'primary' ? 'standard' : 'class'} to explore` : `Browsing ${sub || levelMeta.label}`}
                  </p>
                  <p style={{fontSize:13,color:'#6b7280'}}>
                    {guestNeedsClassChoice
                      ? 'Guests start here. Choose one class to see all its lessons, chapters, and a free video preview.'
                      : 'Switch class anytime to compare lessons before signing up.'}
                  </p>
                </div>
                {!user && (
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <Link href="/pricing" style={{padding:'9px 14px',fontSize:12,fontWeight:700,color:'#374151',background:'#fff',textDecoration:'none',border:'1px solid #e5e7eb',borderRadius:999}}>View plans</Link>
                  </div>
                )}
              </div>
              <div className="courses-sub-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>
                {levelMeta.sub_categories.map((option) => {
                  const active = sub === option;
                  const href = `/courses?level=${levelMeta.key}&sub=${encodeURIComponent(option)}`;
                  return (
                    <Link
                      key={option}
                      href={href}
                      onClick={() => { setSub(option as SubCategory); setPage(1); }}
                      style={{
                        display:'block',
                        padding:'14px 12px',
                        borderRadius:14,
                        border:'1px solid ' + (active ? '#10B981' : '#e5e7eb'),
                        background:active ? '#ecfdf5' : '#fff',
                        textAlign:'left',
                        cursor:'pointer',
                        textDecoration:'none'
                      }}
                    >
                      <p style={{fontSize:13,fontWeight:800,color:active ? '#047857' : '#0a0a0a',marginBottom:4}}>{option}</p>
                      <p style={{fontSize:11,color:active ? '#059669' : '#9ca3af'}}>Open {option} classes</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {sub && !fetching && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:16,padding:'14px 16px',border:'1px solid #e5e7eb',borderRadius:14,background:'#fff'}}>
              <div>
                <p style={{fontSize:15,fontWeight:800,color:'#0a0a0a',marginBottom:4}}>{isPublicLaunchView ? 'Form Four subject catalog' : `${sub} classes`}</p>
                <p style={{fontSize:13,color:'#6b7280'}}>{isPublicLaunchView ? 'Explore focused Form Four lessons and preview real teaching before signing up.' : 'Guests can open any class here and watch a short preview before signing up.'}</p>
              </div>
            </div>
          )}
          <p style={{fontSize:13,color:'#9ca3af',marginBottom:16}}>
            {guestNeedsClassChoice
              ? 'Choose a class to unlock the preview catalog.'
              : fetching
                ? 'Loading...'
                : total+' courses'+(sub?' in '+sub:'')+(subject?' · '+subject:'')+(level?' · '+(isPublicLaunchView ? 'Form Four' : currentLevel.label):'')}
          </p>

          {guestNeedsClassChoice ? (
            <div style={{padding:'48px 24px',background:'linear-gradient(135deg,#f8fafc,#ecfeff)',borderRadius:20,border:'1px solid #e5e7eb'}}>
              <div style={{maxWidth:680}}>
                <p style={{fontSize:12,fontWeight:800,letterSpacing:1,color:G,textTransform:'uppercase',marginBottom:10}}>Guest Preview Path</p>
                <h2 style={{fontSize:28,fontWeight:900,lineHeight:1.15,color:'#0a0a0a',marginBottom:12}}>Choose a class, then preview a real lesson before committing.</h2>
                <p style={{fontSize:15,color:'#4b5563',lineHeight:1.7,marginBottom:22}}>
                  Once you pick a class like {levelMeta?.sub_categories[0]}, Skolr will show only that class’s lessons. Open any lesson to see the instructor, chapters, and a short video preview with a free-signup prompt.
                </p>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  {levelMeta?.sub_categories.slice(0, 4).map((option) => (
                    <button key={option} onClick={() => setSub(option as SubCategory)} style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:'#0a0a0a',background:'#fff',border:'1px solid #d1d5db',borderRadius:999,cursor:'pointer'}}>
                      Explore {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : fetching?(
            <div className="courses-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
              {[1,2,3,4,5,6].map(i=>(
                <div key={i} style={{borderRadius:12,overflow:'hidden',border:'1px solid #e5e7eb'}}>
                  <div style={{height:150,background:'#f3f4f6'}}/>
                  <div style={{padding:14}}><div style={{height:12,background:'#f3f4f6',borderRadius:4,marginBottom:8}}/><div style={{height:10,background:'#f3f4f6',borderRadius:4,width:'60%'}}/></div>
                </div>
              ))}
            </div>
          ):courses.length===0?(
            <div style={{textAlign:'center',padding:'60px 24px',background:'#f9fafb',borderRadius:12,border:'1px solid #e5e7eb'}}>
              <p style={{fontSize:16,fontWeight:700,marginBottom:8}}>No courses found</p>
              <p style={{fontSize:14,color:'#6b7280',marginBottom:16}}>Try a different level or subject.</p>
              <button onClick={()=>{setLevel('');setSub('');setSubject('');}} style={{padding:'10px 20px',fontSize:13,fontWeight:700,color:'#fff',background:G,border:'none',borderRadius:8,cursor:'pointer'}}>Clear filters</button>
            </div>
          ):(
            <div className="courses-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
              {courses.map(c=>{
                const lvl=LEVELS.find(l=>l.id===c.category)||LEVELS[1];
                const access=isActive&&canAccessLevel(user?.subscription_tier,c.category);
                return(
                  <Link key={c.id} href={'/courses/'+c.id}
                    style={{textDecoration:'none',color:'inherit',display:'block',background:'#fff',border:'1px solid #e5e7eb',borderRadius:18,overflow:'hidden',transition:'transform 0.2s,box-shadow 0.2s,border-color 0.2s',boxShadow:'0 12px 34px rgba(15,23,42,0.05)'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 12px 34px rgba(15,23,42,0.05)';}}>
                    <Thumb color={(lvl as any).color||'#3b82f6'} bg={(lvl as any).bg||'#eff6ff'} title={c.title} thumbnailUrl={c.thumbnail_url}/>
                    <div style={{padding:'14px 15px 15px'}}>
                      <div style={{display:'flex',gap:6,marginBottom:9,flexWrap:'wrap'}}>
                        <span style={{fontSize:10,fontWeight:800,padding:'4px 8px',borderRadius:999,background:(lvl as any).bg||'#eff6ff',color:(lvl as any).color||'#3b82f6'}}>{c.sub_category||c.category}</span>
                        <span style={{fontSize:10,fontWeight:800,padding:'4px 8px',borderRadius:999,background:'#f3f4f6',color:'#6b7280'}}>{c.subject}</span>
                      </div>
                      <p style={{fontSize:15,fontWeight:800,lineHeight:1.45,marginBottom:6,color:'#0a0a0a'}}>{c.title}</p>
                      <p style={{fontSize:12,color:'#6b7280',marginBottom:12}}>{c.instructor_name}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                        <span style={{fontSize:11,color:'#f59e0b'}}>★★★★★</span>
                        <span style={{fontSize:12,fontWeight:800,color:access?'#0a0a0a':G}}>{!user?'Preview lesson':'Watch now'}</span>
                      </div>
                      {!user && (
                        <div style={{marginTop:12,padding:'10px 11px',borderRadius:12,background:'#f8fafc',border:'1px solid #e5e7eb'}}>
                          <p style={{fontSize:11,fontWeight:700,color:'#111827',marginBottom:3}}>Guest preview available</p>
                          <p style={{fontSize:11,color:'#6b7280'}}>See chapters, instructor profile, and a short video preview before signup.</p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages>1&&(
            <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:32,marginBottom:16}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{padding:'7px 14px',fontSize:12,fontWeight:600,borderRadius:7,border:'1px solid #e5e7eb',background:'#fff',color:page===1?'#d1d5db':'#374151',cursor:page===1?'default':'pointer'}}>
                Prev
              </button>
              {Array.from({length:Math.min(5,totalPages)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  style={{width:32,height:32,borderRadius:7,border:'1px solid '+(page===p?'#0a0a0a':'#e5e7eb'),background:page===p?'#0a0a0a':'#fff',color:page===p?'#fff':'#374151',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  {p}
                </button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{padding:'7px 14px',fontSize:12,fontWeight:600,borderRadius:7,border:'1px solid #e5e7eb',background:'#fff',color:page===totalPages?'#d1d5db':'#374151',cursor:page===totalPages?'default':'pointer'}}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer/>
      {user && <BottomNav role={user.role} adminTab={user.role === 'admin' ? 'catalog' : undefined} />}
      <style>{`
        @media(max-width:900px){
          .courses-guest-header-inner{padding:0 16px!important;}
          .courses-shell{padding:0 16px 90px!important;display:block!important;}
          .courses-sidebar{display:none!important;}
          .courses-main{padding-left:0!important;padding-top:16px!important;}
          .courses-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;}
          .courses-launch-classes{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
          .courses-launch-subjects{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
          .courses-mobile-toolbar{display:block!important;}
          .courses-hero{padding:24px 16px!important;}
          .courses-hero-inner{align-items:flex-start!important;}
          .courses-top-actions{gap:10px!important;}
        }
        @media(max-width:640px){
          .courses-guest-header-inner{
            height:auto!important;
            min-height:60px!important;
            padding:10px 16px!important;
            flex-wrap:wrap!important;
            align-items:center!important;
          }
          .courses-top-actions{
            margin-left:auto!important;
            width:auto!important;
            display:flex!important;
            grid-template-columns:none!important;
          }
          .courses-top-actions a{
            min-height:40px!important;
            padding:0 16px!important;
            font-size:12px!important;
          }
          .courses-grid{grid-template-columns:1fr!important;}
          .courses-launch-classes{grid-template-columns:1fr!important;}
          .courses-launch-subjects{grid-template-columns:1fr!important;}
          .courses-sub-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
          .courses-hero-stats{
            width:100%!important;
            display:grid!important;
            grid-template-columns:repeat(3,minmax(0,1fr))!important;
            justify-content:stretch!important;
            gap:10px!important;
          }
          .courses-hero-stat-card{
            min-width:0!important;
            padding:12px 8px!important;
          }
          .courses-hero h1{font-size:20px!important;}
          .courses-hero-actions{width:100%!important;display:grid!important;grid-template-columns:1fr!important;}
        }
        @media(max-width:420px){
          .courses-guest-header-inner{gap:10px!important;}
          .courses-top-actions{width:100%!important;justify-content:flex-start!important;}
          .courses-top-actions a{width:100%!important;}
          .courses-sub-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}

export default function CoursesPage(){
  return(
    <Suspense fallback={null}>
      <CoursesContent/>
    </Suspense>
  );
}
