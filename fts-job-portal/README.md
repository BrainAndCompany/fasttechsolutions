# FTS Job Portal

Separate careers / ATS app for Fast Tech Solutions.

- **App folder:** `fts-job-portal/`
- **Supabase project:** `tmcxeobmdzrmsyklzfmg` (dedicated — not admin/employee DB)
- **Production URL:** `https://jobs.fts-ksa.com`
- **Local:** `http://localhost:3001`

## 1. Apply database schema (required once)

Open [SQL Editor](https://supabase.com/dashboard/project/tmcxeobmdzrmsyklzfmg/sql/new) for **this** project and run:

`supabase/migrations/00001_job_portal_schema.sql`

Or:

```bash
DATABASE_URL="postgres://postgres.[ref]:[PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres" npm run db:schema
```

## 2. Environment

Copy `.env.example` → `.env.local` (already pointed at the new project URL + publishable key).

Add from Dashboard → **Settings → API**:

- `SUPABASE_SERVICE_ROLE_KEY` — optional server helper for profile upserts

Auth → URL configuration — add redirect URLs:

- `http://localhost:3001/**`
- `https://jobs.fts-ksa.com/**`

## 3. Run

```bash
npm run dev
```

## 4. First HR user

Signup is always **candidate**. Promote in SQL:

```sql
update public.profiles set role = 'hr' where email = 'hr@fts-ksa.com';
```

Or demote back to candidate:

```sql
update public.profiles set role = 'candidate' where email = 'someone@example.com';
```

## 5. Flow

1. HR creates/publishes jobs in `/hr`
2. Candidates apply at `/jobs/[slug]` → CV in private `cvs` bucket
3. Candidate tracks status at `/dashboard`
4. Marketing site `/careers` loads `GET /api/public/jobs`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production.
