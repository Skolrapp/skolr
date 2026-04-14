// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'instructor' | 'admin';
export type CourseReviewStatus = 'pending' | 'approved' | 'rejected';

export type SubscriptionTier =
  | 'free'
  | 'primary_only'
  | 'secondary_only'
  | 'primary_secondary'
  | 'highschool_only'
  | 'full_k12'
  | 'postgraduate';

export type EducationLevel =
  | 'primary'
  | 'secondary'
  | 'highschool'
  | 'undergraduate'
  | 'masters';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string | null;
  avatar_url?: string;
  is_impersonating?: boolean;
  impersonated_by?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  fingerprint: string;
  device_name: string;
  os: string;
  browser: string;
  ip_address: string;
  last_active: string;
  is_current?: boolean;
}

// ─── Subscription Tiers ───────────────────────────────────────────────────────

export interface SubscriptionBundle {
  id: SubscriptionTier;
  name: string;
  description: string;
  levels: EducationLevel[];
  price_monthly: number;   // TZS
  price_annual: number;    // TZS
  popular?: boolean;
  badge?: string;
  color: string;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export type SubCategory =
  | 'Std 1' | 'Std 2' | 'Std 3' | 'Std 4' | 'Std 5' | 'Std 6' | 'Std 7'
  | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'
  | 'Form 5' | 'Form 6'
  | 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4'
  | null;

export interface Course {
  id: string;
  title: string;
  description?: string;
  category: EducationLevel;
  sub_category?: SubCategory;
  subject: string;
  instructor_id: string;
  instructor_name?: string;
  thumbnail_url?: string;
  video_hls_url: string;
  duration_seconds: number;
  is_published: boolean;
  language: 'en' | 'sw' | 'both';
  view_count: number;
  review_status?: CourseReviewStatus | null;
  admin_notes?: string | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_seconds: number;
  completed: boolean;
  enrolled_at: string;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export type PaymentProvider = 'mpesa' | 'tigopesa' | 'airtelmoney' | 'card';
export type PaymentStatus   = 'pending' | 'success' | 'failed' | 'refunded';
export type BillingCycle    = 'monthly' | 'annual';

export interface Transaction {
  id: string;
  user_id: string;
  instructor_id?: string;
  subscription_tier: SubscriptionTier;
  billing_cycle: BillingCycle;
  amount: number;
  platform_fee: number;
  net_amount: number;
  provider: PaymentProvider;
  provider_reference?: string;
  msisdn?: string;
  status: PaymentStatus;
  created_at: string;
  settled_at?: string;
}

export interface EarningsSummary {
  total_revenue: number;
  platform_fee: number;
  net_balance: number;
  pending_payout: number;
  transactions: Transaction[];
  period: 'month' | 'quarter' | 'year';
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_hls_url: string;
  duration_seconds: number;
  order_index: number;
  is_published: boolean;
  release_at?: string | null;
  created_at: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  chapter_id?: string | null;
  chapter_title?: string | null;
  title: string;
  type: string;
  url?: string | null;
  description?: string | null;
  created_by?: string | null;
  storage_bucket?: string | null;
  storage_path?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  created_at: string;
}
