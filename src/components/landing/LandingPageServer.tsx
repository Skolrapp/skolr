import LandingClient from '@/components/landing/LandingClient';
import { FORM_FOUR_CLASS, PUBLIC_LAUNCH_SUBJECT_NAMES } from '../../lib/launchCatalog';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { Course } from '@/types';

const BRANDING_BUCKET = process.env.SUPABASE_BRANDING_BUCKET || 'site-branding';
const BANNER_SLOTS = [
  'hero-banner',
  'campaign-banner',
  'campaign-artwork-1',
  'campaign-artwork-2',
  'message-placeholder-1',
  'message-placeholder-2',
  'message-placeholder-3',
] as const;

async function getInitialBanners() {
  const supabase = createSupabaseAdmin();
  const empty = Object.fromEntries(BANNER_SLOTS.map((slot) => [slot, null])) as Record<string, string | null>;
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === BRANDING_BUCKET);

  if (!exists) return empty;

  const { data: files } = await supabase.storage.from(BRANDING_BUCKET).list('landing', {
    limit: 50,
    sortBy: { column: 'updated_at', order: 'desc' },
  });

  return Object.fromEntries(
    BANNER_SLOTS.map((slot) => {
      const activeBanner = (files || []).find((file) => file.name.startsWith(slot));
      if (!activeBanner) return [slot, null];
      const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(`landing/${activeBanner.name}`);
      return [slot, data.publicUrl];
    })
  ) as Record<string, string | null>;
}

async function getInitialCourses() {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from('courses')
    .select('*, users!instructor_id(name)')
    .eq('is_published', true)
    .eq('category', FORM_FOUR_CLASS.level)
    .eq('sub_category', FORM_FOUR_CLASS.subCategory || null)
    .in('subject', PUBLIC_LAUNCH_SUBJECT_NAMES)
    .order('created_at', { ascending: false })
    .limit(7);

  return ((data || []) as Array<Record<string, unknown> & { users?: { name: string } | null }>).map((course) => ({
    ...course,
    instructor_name: course.users?.name || 'Unknown',
    users: undefined,
  })) as unknown as Course[];
}

export async function LandingPageServer() {
  const [initialCourses, initialBanners] = await Promise.all([
    getInitialCourses(),
    getInitialBanners(),
  ]);

  return <LandingClient initialCourses={initialCourses} initialBanners={initialBanners} />;
}
