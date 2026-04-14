import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const BRANDING_BUCKET = process.env.SUPABASE_BRANDING_BUCKET || 'site-branding';
const BANNER_SLOTS = ['hero-banner', 'campaign-banner', 'message-placeholder-1', 'message-placeholder-2', 'message-placeholder-3'] as const;

export async function GET() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((bucket) => bucket.name === BRANDING_BUCKET);

  if (!exists) {
    return NextResponse.json({
      success: true,
      data: {
        banners: Object.fromEntries(BANNER_SLOTS.map((slot) => [slot, null])),
      },
    });
  }

  const { data: files } = await supabase.storage.from(BRANDING_BUCKET).list('landing', {
    limit: 20,
    sortBy: { column: 'updated_at', order: 'desc' },
  });

  const banners = Object.fromEntries(
    BANNER_SLOTS.map((slot) => {
      const activeBanner = (files || []).find((file) => file.name.startsWith(slot));
      if (!activeBanner) return [slot, null];
      const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(`landing/${activeBanner.name}`);
      return [slot, data.publicUrl];
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      banners,
    },
  });
}
