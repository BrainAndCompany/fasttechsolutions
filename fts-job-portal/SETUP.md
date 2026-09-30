# One-time schema setup (new Supabase project)

Your project ref: **tmcxeobmdzrmsyklzfmg**  
Publishable key is already in `.env.local`.

## Apply schema now

1. Open: https://supabase.com/dashboard/project/tmcxeobmdzrmsyklzfmg/sql/new  
2. Paste **all** of `supabase/migrations/00001_job_portal_schema.sql`  
3. Click **Run**

This creates: `profiles`, `jobs`, `applications`, `application_events`, RLS, Storage bucket `cvs`, view `public_jobs`.

## Then add service role (optional)

Dashboard → **Settings → API** → `service_role` → paste into `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Optional: Database URI for `npm run db:schema`

Settings → **Database** → Connection string (URI) → set `DATABASE_URL` then:

```bash
npm run db:schema
```

## Make someone HR

Signup always creates **candidate**. Promote in SQL:

```sql
update public.profiles
set role = 'hr'
where email = 'hr@fts-ksa.com';
```

Confirm:

```sql
select id, email, role from public.profiles where email = 'hr@fts-ksa.com';
```

## Schema upgrades

After pulling new migrations, run them in SQL Editor too (in order):

- `00001_job_portal_schema.sql` (once)
- `00002_candidate_profile_and_questions.sql` (profile fields, JD sections, screening questions)
