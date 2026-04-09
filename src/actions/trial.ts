'use server';

import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import type { SubscriptionTier } from '@/types';

export async function startFreeTrialAction(tier: SubscriptionTier) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated. Please sign in again.' };

    if (user.subscription_tier !== 'free') {
      return { error: 'Free trial is only available for accounts on the free plan.' };
    }

    const supabase = createSupabaseAdmin();

    // Check if trial was already used
    let alreadyUsed = false;
    const { data } = await supabase
      .from('users')
      .select('subscription_expires_at')
      .eq('id', user.id)
      .single();

    // If they ever had an expiry set, they already used the trial
    if (data?.subscription_expires_at) alreadyUsed = true;

    if (alreadyUsed) {
      return { error: 'You have already used your free trial.' };
    }

    // Set expiry 7 days from now
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_tier:       tier,
        subscription_expires_at: expires.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[trial] Supabase update error:', updateError);
      return { error: `Could not activate trial: ${updateError.message}` };
    }

    const bundleName = tier.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const expiryStr  = expires.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

    return {
      success:   true,
      message:   `Trial activated! You now have ${bundleName} access until ${expiryStr}.`,
      expiresAt: expires.toISOString(),
    };

  } catch (err) {
    console.error('[trial] Error:', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}
