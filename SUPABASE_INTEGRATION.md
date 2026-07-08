# House of Midas Pen — Supabase Integration Guide

Complete setup from zero to a live production deploy.

---

## 1. Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your **Project URL** and **anon/public API key** from:
   `Project Settings → API → Project URL / Project API Keys`

---

## 2. Run Migrations

In your Supabase dashboard, go to **SQL Editor** and run the two migration files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

Or using the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## 3. Configure Storage Buckets

The migration already creates the buckets via SQL. Verify them in:
`Storage → Buckets`

You should see:
- `avatars` (public)
- `covers` (public)
- `banners` (public)
- `chapter-panels` (public)
- `downloads` (private — authenticated users only)

---

## 4. Set Up Authentication

In Supabase dashboard → **Authentication → Providers**:

- Email/Password: **Enable**
- Confirm email: Set to your preference (disable for faster dev testing)

For password reset emails to work, set your **Site URL** under:
`Authentication → URL Configuration → Site URL`

Example: `https://your-domain.vercel.app`

---

## 5. Set Admin Role

Your admin email (`thesage196@gmail.com`) is automatically assigned `admin` role via the `handle_new_user` trigger when that account signs up. If you need to manually promote an existing user:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'thesage196@gmail.com';
```

---

## 6. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 7. Local Development

```bash
npm install
npm run dev
```

---

## 8. Deploy to Vercel

1. Push to GitHub.
2. Import repo in Vercel.
3. Add environment variables in Vercel → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.

---

## 9. Seed Initial Content (Optional)

The seed data in `src/data/site.ts` is used as a fallback when Supabase returns no rows (e.g. before you've added content). To populate Supabase with real series:

Use the admin dashboard at `/admin` → **Manage Series** to add manhwa, or insert directly via SQL:

```sql
INSERT INTO manhwa (title, status, blurb, year, cover_url, banner_url)
VALUES (
  'Rise of the Dormant Hybrid',
  'Ongoing',
  'Born wolfless and hunted after the brutal fall of her pack...',
  2025,
  'https://your-cover-url.jpg',
  'https://your-banner-url.jpg'
);
```

---

## Architecture Overview

```
src/
├── lib/
│   └── supabase.ts          # Supabase client
├── types/
│   └── database.ts          # Full TypeScript DB types
├── services/
│   ├── auth.service.ts      # Auth + profile operations
│   └── manhwa.service.ts    # All content operations
├── hooks/
│   └── queries.ts           # React Query hooks for every feature
├── store/
│   ├── auth.ts              # Zustand auth store (Supabase-backed)
│   └── manhwa.ts            # Zustand manhwa store (Supabase-backed)
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_rls_policies.sql
```

### Data Flow

```
Component
  → useManhwa() / useAuth()        (Zustand — sync, optimistic)
  → useQuery() / useMutation()     (React Query — async, cached)
  → manhwaService / authService    (Service layer — clean API)
  → supabase client                (Supabase JS SDK)
  → Supabase DB / Storage / Auth
```

### Seed Fallback

If Supabase is not configured or returns 0 rows, the manhwa store automatically falls back to `seedManhwa`, `seedChapters`, and `seedComments` from `src/data/site.ts`. This means the app is always functional during development even before the DB is seeded.

---

## Feature Mapping

| Feature | Implementation |
|---|---|
| Auth (signup/login/logout) | `supabase.auth` + `store/auth.ts` |
| Session persistence | Supabase `persistSession: true` |
| Password reset | `supabase.auth.resetPasswordForEmail()` |
| Protected routes | `useAuth` in route components |
| Admin role | `profiles.role = 'admin'`, checked in RLS + store |
| Profiles + avatar upload | `profileService`, `avatars` bucket |
| Library save/remove | `library` table, `libraryService` |
| Reading progress | `reading_progress` table, `progressService` |
| Comments + replies | `comments` table, `commentService` |
| Comment likes | `comment_likes` table, trigger |
| Reviews + ratings | `reviews` table, trigger recalculates `manhwa.rating` |
| Chapter panels | `panels` table, lazy-fetched in reader |
| Panel upload | `chapter-panels` Storage bucket |
| Cover/banner upload | `covers` / `banners` buckets |
| Downloads | `downloads` table, `downloads` bucket |
| Search | `search_manhwa()` SQL function (trigram) |
| Admin dashboard | `admin_stats` view, `adminService` |
| Analytics | `analytics` table, event inserts |
| Notifications | `notifications` table (ready for implementation) |
| Reports/moderation | `reports` + `moderation_log` tables (ready) |
| RLS | All tables have full row-level policies |
| Realtime | Ready — wire `supabase.channel()` to any table |
