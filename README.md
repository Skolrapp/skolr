# Skolr — Your HD Classroom

Tanzania's premier HD education platform. Built with **Next.js 15 App Router**, **Supabase (PostgreSQL)**, **Server Actions**, **HLS.js ABR** video, and **Flutterwave** mobile money payments.

---

## Quick Start

### 1. Create a Supabase project

1. Go to https://supabase.com and create a free account
2. Create a new project (pick any name, e.g. "skolr")
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the entire contents of `src/lib/supabase/schema.sql`
5. Click **Run** — this creates all tables and inserts 4 demo users

### 2. Get your Supabase keys

Go to **Project Settings → API** and copy:
- `Project URL`
- `anon` (public) key
- `service_role` (secret) key

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=any-random-string-32-chars-or-more
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Demo accounts

| Role       | Phone         | Password   |
|------------|---------------|------------|
| Student    | +255712000001 | password   |
| Student    | +255712000002 | password   |
| Instructor | +255712000010 | password   |
| Instructor | +255712000011 | password   |

> The schema.sql inserts users with the bcrypt hash of `password`. Change these after setup.

---

## Architecture

```
src/
├── actions/              ← Next.js Server Actions (mutations)
│   ├── auth.ts           ← login, register, logout
│   └── courses.ts        ← saveProgress, uploadCourse
├── app/
│   ├── (auth)/           ← login, register pages
│   ├── (app)/            ← dashboard, courses, watch, instructor, settings
│   └── api/              ← REST endpoints (auth, courses, payments, devices)
├── components/
│   ├── layout/BottomNav  ← Role-aware mobile nav
│   └── player/VideoPlayer ← HLS.js ABR with quality selector
├── lib/
│   ├── supabase/         ← server.ts + client.ts + schema.sql
│   ├── auth.ts           ← JWT sessions, single-session, device limit
│   ├── subscriptions.ts  ← 6 tier bundles + access control
│   ├── payments.ts       ← Flutterwave + Pesapal integration
│   └── constants.ts      ← Client-safe constants only
└── middleware.ts          ← Edge-safe JWT-only route protection
```

---

## Subscription Tiers

| Tier               | Levels            | Monthly (TZS) | Annual (TZS) |
|--------------------|-------------------|---------------|--------------|
| Primary Only        | Std 1–7           | 5,000         | 50,000       |
| Secondary Only      | Form 1–4          | 8,000         | 80,000       |
| Primary & Secondary | Std 1–7 + Form 1–4| 12,000        | 110,000      |
| High School Only    | Form 5–6          | 10,000        | 95,000       |
| Full K-12           | Primary–High School| 18,000       | 170,000      |
| Post-Graduate       | University + Masters| 20,000      | 190,000      |

---

## Payments

**Default:** Flutterwave (Tanzania mobile money — M-Pesa, Tigo Pesa, Airtel Money)

Set credentials in `.env.local`:
```env
PAYMENT_PROVIDER=flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxx
FLUTTERWAVE_WEBHOOK_SECRET=your-secret
```

Webhook URL to register in Flutterwave dashboard:
```
https://yourdomain.tz/api/payments/webhook?provider=flutterwave
```

The webhook automatically updates `subscription_tier` and `subscription_expires_at` in Supabase when payment succeeds.

---

## Adding real courses

1. Upload video to **Cloudflare Stream**, **Mux**, or **AWS CloudFront**
2. Get the `.m3u8` HLS manifest URL
3. Sign in as an Instructor
4. Go to Upload → fill in details → paste the `.m3u8` URL
5. Go to Supabase → Table Editor → courses → set `is_published = true`

---

## Production deployment

```bash
npm run build
# Deploy to Vercel:
vercel --prod
```

Set all `.env.local` variables in Vercel → Project → Environment Variables.
