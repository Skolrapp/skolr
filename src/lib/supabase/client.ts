import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client — use in Client Components.
 * Safe to import in 'use client' files.
 */
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
