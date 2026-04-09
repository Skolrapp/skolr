import type { SubscriptionBundle, SubscriptionTier, EducationLevel } from '@/types';

// ─── Tier definitions ─────────────────────────────────────────────────────────

export const SUBSCRIPTION_BUNDLES: SubscriptionBundle[] = [
  {
    id: 'primary_only',
    name: 'Primary',
    description: 'Full access to Standard 1–7 curriculum',
    levels: ['primary'],
    price_monthly: 5_000,
    price_annual:  50_000,
    color: '#34d399',
  },
  {
    id: 'secondary_only',
    name: 'Secondary',
    description: 'O-Level Form 1–4 · NECTA preparation',
    levels: ['secondary'],
    price_monthly: 8_000,
    price_annual:  80_000,
    color: '#60a5fa',
  },
  {
    id: 'primary_secondary',
    name: 'Primary & Secondary',
    description: 'Standard 1–7 plus O-Level Form 1–4',
    levels: ['primary', 'secondary'],
    price_monthly: 12_000,
    price_annual:  110_000,
    popular: true,
    color: '#10B981',
  },
  {
    id: 'highschool_only',
    name: 'High School',
    description: 'A-Level Form 5–6 · University preparation',
    levels: ['highschool'],
    price_monthly: 10_000,
    price_annual:  95_000,
    color: '#fbbf24',
  },
  {
    id: 'full_k12',
    name: 'Full K-12',
    description: 'Everything: Primary, Secondary & High School',
    levels: ['primary', 'secondary', 'highschool'],
    price_monthly: 18_000,
    price_annual:  170_000,
    badge: 'Best Value',
    color: '#a78bfa',
  },
  {
    id: 'postgraduate',
    name: 'Post-Graduate',
    description: 'University (Year 1–4) and Masters programmes',
    levels: ['undergraduate', 'masters'],
    price_monthly: 20_000,
    price_annual:  190_000,
    color: '#f472b6',
  },
];

export const BUNDLE_MAP = Object.fromEntries(
  SUBSCRIPTION_BUNDLES.map(b => [b.id, b])
) as Record<SubscriptionTier, SubscriptionBundle>;

// ─── Access control ───────────────────────────────────────────────────────────

/**
 * Returns which education levels a given subscription tier can access.
 * 'free' tier gets no paid content.
 */
export function getAccessibleLevels(tier: SubscriptionTier): EducationLevel[] {
  if (tier === 'free') return [];
  return BUNDLE_MAP[tier]?.levels ?? [];
}

/**
 * Returns true if the given tier can access the given education level.
 */
export function canAccessLevel(tier: SubscriptionTier, level: EducationLevel): boolean {
  return getAccessibleLevels(tier).includes(level);
}

/**
 * Returns true if the user's subscription is currently active.
 */
export function isSubscriptionActive(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

/**
 * Calculates expiry date from billing cycle.
 */
export function getExpiryDate(cycle: 'monthly' | 'annual'): Date {
  const d = new Date();
  if (cycle === 'annual') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}
