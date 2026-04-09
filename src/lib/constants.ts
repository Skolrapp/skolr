/**
 * Client-safe constants — no Node.js or database imports.
 * Safe to import in 'use client' components.
 */

import type { SubscriptionTier, EducationLevel } from '@/types';

export const PLATFORM_FEE_RATE = 0.30;

export const MOBILE_MONEY_PROVIDERS = [
  { id: 'mpesa',       label: 'M-Pesa',       network: 'Vodacom Tanzania', color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  { id: 'tigopesa',    label: 'Tigo Pesa',    network: 'Mixx by Yass',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  { id: 'airtelmoney', label: 'Airtel Money', network: 'Airtel Tanzania',  color: '#fb923c', bg: 'rgba(251,146,60,0.1)'  },
] as const;

export const BILLING_CYCLES = [
  { id: 'monthly' as const, label: 'Monthly', discount: null },
  { id: 'annual'  as const, label: 'Annual',  discount: 'Save ~17%' },
] as const;

export const LEVEL_COLORS: Record<EducationLevel, { bg: string; color: string; label: string }> = {
  primary:       { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Primary'       },
  secondary:     { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', label: 'Secondary'      },
  highschool:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'High School'    },
  undergraduate: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'Undergraduate'  },
  masters:       { bg: 'rgba(244,114,182,0.12)', color: '#f472b6', label: 'Masters'        },
};

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English Language', 'Kiswahili', 'History', 'Geography',
  'Commerce', 'Accountancy', 'Computer Science', 'Civics',
  'General Studies', 'Literature in English', 'Economics',
  'Business Studies', 'Agriculture', 'Fine Art', 'Music',
  'Physical Education', 'Islamic Studies', 'French', 'Arabic', 'Other',
] as const;

export const EDUCATION_LEVELS: Array<{ key: EducationLevel; label: string; description: string; sub_categories: string[] }> = [
  { key: 'primary',       label: 'Primary',              description: 'Standard 1–7',          sub_categories: ['Std 1','Std 2','Std 3','Std 4','Std 5','Std 6','Std 7'] },
  { key: 'secondary',     label: 'Secondary (O-Level)',   description: 'Form 1–4 · NECTA',      sub_categories: ['Form 1','Form 2','Form 3','Form 4'] },
  { key: 'highschool',    label: 'High School (A-Level)', description: 'Form 5–6 · NECTA',      sub_categories: ['Form 5','Form 6'] },
  { key: 'undergraduate', label: 'Undergraduate',         description: 'University · Year 1–4', sub_categories: ['Year 1','Year 2','Year 3','Year 4'] },
  { key: 'masters',       label: 'Masters',               description: 'Postgraduate',           sub_categories: [] },
];
