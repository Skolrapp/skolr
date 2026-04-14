import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const BRANDING_BUCKET = process.env.SUPABASE_BRANDING_BUCKET || 'site-branding';

export async function GET() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === BRANDING_BUCKET);

  if (!exists) {
    return NextResponse.json({ success: true, data: { landingBannerUrl: null } });
  }

  const { data: files } = await supabase.storage.from(BRANDING_BUCKET).list('landing', {
    limit: 20,
    sortBy: { column: 'updated_at', order: 'desc' },
  });

  const activeBanner = (files || []).find((file) => file.name.startsWith('hero-banner'));

  if (!activeBanner) {
    return NextResponse.json({ success: true, data: { landingBannerUrl: null } });
  }

  const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(`landing/${activeBanner.name}`);

  return NextResponse.json({
    success: true,
    data: {
      landingBannerUrl: data.publicUrl,
    },
  });
}
