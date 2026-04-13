'use client';
export const dynamic = 'force-dynamic';
import { useState, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { canAccessLevel, isSubscriptionActive } from '@/lib/subscriptions';
import type { Course, EducationLevel } from '@/types';

const G = '#10B981';
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

function Thumb({color,bg,title}:{color:string;bg:string;title:string}){
  return(
    <div style={{width:'100%',aspectRatio:'16/9',background:'linear-gradient(135deg,'+bg+','+color+'22)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-12,right:-12,width:70,height:70,borderRadius:'50%',background:color+'18'}}/>
      <div style={{width:38,height:38,borderRadius:9,background:color,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
        <span style={{color:'#fff',fontSize:15,fontWeight:800}}>{title.charAt(0)}</span>
      </div>
    </div>
  );
}

function CoursesContent(){
  const {user}=useAuth();
  const sp=useSearchParams();
  const [level,setLevel]=useState<EducationLevel|''>((sp.get('level') as EducationLevel)||'');
  const [subject,setSubject]=useState(sp.get('subject')||'');
  const [sort,setSort]=useState('popular');
  const [courses,setCourses]=useState<Course[]>([]);
  const [total,setTotal]=useState(0);
  const [page,setPage]=useState(1);
  const [fetching,setFetching]=useState(true);
  const PER=9;

  const fetchCourses=useCallback(()=>{
    setFetching(true);
    const params=new URLSearchParams();
    if(level)params.set('level',level);
    if(subject)params.set('subject',subject);
    params.set('per_page',String(PER));
    params.set('page',String(page));
    fetch('/api/courses?'+params.toString(),{credentials:'include'})
      .then(r=>r.json())
      .then(d=>{if(d.success){setCourses(d.data.items);setTotal(d.data.total||d.data.items.length);}})
      .finally(()=>setFetching(false));
  },[level,subject,page]);

  useEffect(()=>{fetchCourses();},[fetchCourses]);

  const currentLevel=LEVELS.find(l=>l.id===level)||LEVELS[0];
  const isActive=isSubscriptionActive(user?.subscription_expires_at);
  const totalPages=Math.ceil(total/PER);
  const sortLabel = SORT_OPTIONS.find((option) => option.id === sort)?.label || 'Most popular';

  // guests can browse freely

  return(
    <div style={{background:'#fff',minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0a0a0a'}}>
      {user ? <TopHeader /> : (
        <header style={{background:'#fff',borderBottom:'1px solid #e5e7eb',position:'sticky',top:0,zIndex:50}}>
          <div style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',gap:16,height:60,padding:'0 24px'}}>
            <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none',flexShrink:0}}>
              <div style={{width:30,height:30,background:G,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{fontWeight:800,fontSize:18,color:'#0a0a0a'}}>Skolr</span>
            </Link>
          </div>
        </header>
      )}

      <div className="courses-hero" style={{background:level?'linear-gradient(135deg,'+(currentLevel as any).color+'dd,'+(currentLevel as any).color+'aa)':'linear-gradient(135deg,#0a0a0a,#1a1a2e)',padding:'28px 24px'}}>
        <div className="courses-hero-inner" style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:'#fff',marginBottom:6}}>{currentLevel.label==='All Levels'?'All Courses':currentLevel.label+' Courses'}</h1>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.65)',marginBottom:12}}>{(currentLevel as any).sub||'Browse all education levels'} · {total} courses</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {LEVELS.slice(1).map(l=>(
                <button key={l.id} onClick={()=>{setLevel(l.id as EducationLevel);setPage(1);}}
                  style={{padding:'4px 12px',fontSize:11,fontWeight:600,borderRadius:999,border:'none',background:level===l.id?'#fff':'rgba(255,255,255,0.18)',color:level===l.id?'#0a0a0a':'#fff',cursor:'pointer'}}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="courses-hero-stats" style={{display:'flex',gap:20}}>
            {[['Courses',String(total)],['Subjects','12'],['Students','8.4K']].map(([lbl,val])=>(
              <div key={lbl} style={{textAlign:'center'}}>
                <p style={{fontSize:20,fontWeight:800,color:'#fff'}}>{val}</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="courses-shell" style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:0,padding:'0 24px',alignItems:'flex-start'}}>
        <aside className="courses-sidebar" style={{width:220,flexShrink:0,paddingTop:24,paddingRight:24,borderRight:'1px solid #e5e7eb',minHeight:600}}>
          <div style={{marginBottom:24}}>
            <p style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Subject</p>
            <button onClick={()=>setSubject('')} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'6px 8px',borderRadius:7,border:'none',background:!subject?'#ecfdf5':'transparent',color:!subject?'#059669':'#6b7280',fontSize:12,fontWeight:!subject?700:400,cursor:'pointer',textAlign:'left',marginBottom:2}}>
              <div style={{width:7,height:7,borderRadius:2,background:!subject?G:'#e5e7eb',flexShrink:0}}/>All subjects
            </button>
            {SUBJECTS.map(s=>(
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
          <div className="courses-mobile-toolbar" style={{display:'none',marginBottom:16}}>
            <div className="courses-mobile-pills" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:11,fontWeight:700,padding:'6px 10px',borderRadius:999,background:'#ecfdf5',color:'#059669'}}>
                {subject || 'All subjects'}
              </span>
              <span style={{fontSize:11,fontWeight:700,padding:'6px 10px',borderRadius:999,background:'#f3f4f6',color:'#6b7280'}}>
                {sortLabel}
              </span>
            </div>
          </div>
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16,scrollbarWidth:'none'}}>
            {LEVELS.map(l=>(
              <button key={l.id} onClick={()=>{setLevel(l.id as EducationLevel);setPage(1);}}
                style={{padding:'6px 14px',fontSize:11,fontWeight:600,borderRadius:999,border:'1.5px solid '+(level===l.id?'#0a0a0a':'#e5e7eb'),background:level===l.id?'#0a0a0a':'#fff',color:level===l.id?'#fff':'#6b7280',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                {l.label}
              </button>
            ))}
          </div>
          <p style={{fontSize:13,color:'#9ca3af',marginBottom:16}}>{fetching?'Loading...':total+' courses'+(subject?' in '+subject:'')+(level?' · '+currentLevel.label:'')}</p>

          {fetching?(
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
              <button onClick={()=>{setLevel('');setSubject('');}} style={{padding:'10px 20px',fontSize:13,fontWeight:700,color:'#fff',background:G,border:'none',borderRadius:8,cursor:'pointer'}}>Clear filters</button>
            </div>
          ):(
            <div className="courses-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
              {courses.map(c=>{
                const lvl=LEVELS.find(l=>l.id===c.category)||LEVELS[1];
                const access=isActive&&canAccessLevel(user?.subscription_tier,c.category);
                return(
                  <Link key={c.id} href={'/watch/'+c.id}
                    style={{textDecoration:'none',color:'inherit',display:'block',background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden',transition:'transform 0.2s,box-shadow 0.2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                    <Thumb color={(lvl as any).color||'#3b82f6'} bg={(lvl as any).bg||'#eff6ff'} title={c.title}/>
                    <div style={{padding:'12px 14px'}}>
                      <div style={{display:'flex',gap:5,marginBottom:7}}>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:(lvl as any).bg||'#eff6ff',color:(lvl as any).color||'#3b82f6'}}>{c.sub_category||c.category}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:'#f3f4f6',color:'#6b7280'}}>{c.subject}</span>
                      </div>
                      <p style={{fontSize:13,fontWeight:700,lineHeight:1.4,marginBottom:5,color:'#0a0a0a'}}>{c.title}</p>
                      <p style={{fontSize:11,color:'#9ca3af',marginBottom:10}}>{c.instructor_name}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontSize:11,color:'#f59e0b'}}>★★★★★</span>
                        <span style={{fontSize:11,fontWeight:700,color:access?'#0a0a0a':G}}>{!user?'Sign up to watch':access?'Watch now':'Free trial'}</span>
                      </div>
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
          .courses-shell{padding:0 16px 90px!important;display:block!important;}
          .courses-sidebar{display:none!important;}
          .courses-main{padding-left:0!important;padding-top:16px!important;}
          .courses-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;}
          .courses-mobile-toolbar{display:block!important;}
          .courses-hero{padding:24px 16px!important;}
          .courses-hero-inner{align-items:flex-start!important;}
        }
        @media(max-width:640px){
          .courses-grid{grid-template-columns:1fr!important;}
          .courses-hero-stats{width:100%!important;justify-content:space-between!important;gap:12px!important;}
          .courses-hero h1{font-size:20px!important;}
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
