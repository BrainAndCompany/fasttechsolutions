# Deploying FTS Job Portal (`jobs.fts-ksa.com`)

Dedicated Next.js app + **dedicated Supabase project** (`tmcxeobmdzrmsyklzfmg`).

Do **not** point this app at the admin/employee Supabase project.

---

## 1. Supabase (job portal project)

1. Confirm schema applied (`00001_job_portal_schema.sql`).
2. **Authentication → URL configuration**
   - Site URL: `https://jobs.fts-ksa.com`
   - Redirect URLs:
     - `https://jobs.fts-ksa.com/**`
     - `http://localhost:3001/**` (dev)
3. Keep Storage bucket `cvs` private (created by migration).

---

## 2. Hosting env (HosterPK / Vercel / etc.)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tmcxeobmdzrmsyklzfmg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_APP_URL=https://jobs.fts-ksa.com

# HosterPK mailbox hr@fts-ksa.com (SMTP SSL — no Resend)
# Use s23.hosterpk.com — mail.fts-ksa.com currently points at Vercel
SMTP_HOST=s23.hosterpk.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hr@fts-ksa.com
SMTP_PASSWORD=your_mailbox_password
SMTP_FROM=hr@fts-ksa.com
HR_NOTIFY_EMAIL=hr@fts-ksa.com
```

Build: `npm run build` then `npm start` (port 3001 or host default).

DNS: `jobs.fts-ksa.com` → this deployment.

**Portal login** still uses Supabase (email + password). Create / promote `hr@fts-ksa.com` as role `hr` so that mailbox owner signs into the HR console. SMTP only **sends** mail from that mailbox (new applications + status updates).

---

## 3. Marketing site (`fts-site`)

Set:

```env
JOB_PORTAL_URL=https://jobs.fts-ksa.com
# optional override if API is proxied:
# JOB_PORTAL_API_URL=https://jobs.fts-ksa.com/api/public/jobs
```

Careers page fetches published jobs from the portal public API and deep-links **Apply** to the portal.

---

## 4. HR access (SQL only)

Signup is always **candidate**. Promote HR in Supabase SQL Editor:

```sql
update public.profiles
set role = 'hr'
where email = 'hr@fts-ksa.com';
```

Then that user signs in at `/login` → `/hr`.

---

## 5. Smoke test

1. HR: create + publish a job  
2. Candidate: signup → apply + CV  
3. HR: change status → candidate dashboard updates  
4. Site `/careers` lists the published job  
