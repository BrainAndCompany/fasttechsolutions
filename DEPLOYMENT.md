# Deploying Admin & Employee Portals on HosterPK

Both portals use **one Supabase project** (one database). You deploy **two separate Next.js apps** on two subdomains.

- **admin.fts-ksa.com** → Admin portal (`fts-admin`)
- **employee.fts-ksa.com** (or **employee-fts-ksa.com**) → Employee portal (`fts-employee`)

**Job portal is separate:** see [`fts-job-portal/DEPLOYMENT.md`](./fts-job-portal/DEPLOYMENT.md) — subdomain **jobs.fts-ksa.com**, **dedicated** Supabase project (`tmcxeobmdzrmsyklzfmg`), not this shared admin/employee DB.

Use your actual subdomains in env vars and Supabase redirect URLs below.

Nothing in the codebase changes; only environment variables and deployment targets differ.

---

## 1. Same database (Supabase)

- Keep using your **existing Supabase project**.
- **Admin** and **Employee** apps both use the **same**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- You do **not** create a second database. One Supabase project serves both apps.

---

## 2. Supabase: allowed redirect URLs

In **Supabase Dashboard** â†’ **Authentication** â†’ **URL Configuration**:

- **Site URL:** e.g. `https://admin.fts-ksa.com` (or leave as one primary).
- **Redirect URLs:** add both portals (use your real employee subdomain if different):
  - `https://admin.fts-ksa.com/**`
  - `https://employee.fts-ksa.com/**`
  - `https://employee-fts-ksa.com/**`   *(if you use this subdomain)*
  - `https://admin.fts-ksa.com/api/auth/callback`
  - `https://employee.fts-ksa.com/api/auth/callback`
  - `https://employee-fts-ksa.com/api/auth/callback`   *(if you use this subdomain)*

Save. This keeps login/callback working for both subdomains.

---

## 3. Environment variables per app

### Admin portal (admin.fts-ksa.com) "“ `fts-admin`

Set these in your HosterPK panel (or `.env.production`) for the **admin** app:

```env
# Same Supabase project as employee
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin portal public URL (for emails and links)
NEXT_PUBLIC_APP_URL=https://admin.fts-ksa.com

# SMTP (invitation + credentials emails) — noreply@fts-ksa.com
SMTP_HOST=mail.fts-ksa.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@fts-ksa.com
SMTP_PASSWORD=your_mailbox_password
SMTP_FROM=noreply@fts-ksa.com
# Canonical portal URL in the post-accept credentials email (default https://admin.fts-ksa.com)
ADMIN_PORTAL_PUBLIC_URL=https://admin.fts-ksa.com

# So "Add user" and "Add employee" emails link to the correct portals
EMPLOYEE_PORTAL_URL=https://employee.fts-ksa.com
```

Use the **same** Supabase values as in the employee app.

### Employee portal (employee.fts-ksa.com) "“ `fts-employee`

Set these for the **employee** app:

```env
# Same Supabase project as admin
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# So "Admin view" and "Open Admin Portal" point to admin subdomain
NEXT_PUBLIC_ADMIN_PORTAL_URL=https://admin.fts-ksa.com
```

Again: **same** Supabase URL and keys as admin; only the portal URL differs.

---

## 4. Deploying on HosterPK (two separate apps)

You have **two Next.js apps** in one repo:

- `fts-admin/`  â†’ admin.fts-ksa.com  
- `fts-employee/` â†’ employee.fts-ksa.com  

### Option A: Two Node.js applications (recommended if HosterPK supports Node)

1. **Build each app** on the server or in CI:
   ```bash
   cd fts-admin
   npm ci
   npm run build
   ```
   ```bash
   cd fts-employee
   npm ci
   npm run build
   ```

2. **Run each app** (e.g. different ports or processes):
   ```bash
   cd fts-admin && npm run start   # e.g. port 3000
   cd fts-employee && npm run start # e.g. port 3001
   ```

3. In **HosterPK** (cPanel or panel):
   - Create **two applications** (Node.js / "Add application").
   - **App 1:**  
     - Root/directory: path to `fts-admin` (e.g. `admin` or `public_html/admin`).  
     - Start command: `npm run start` (or `node .next/standalone/server.js` if you use `output: 'standalone'`).  
     - Subdomain: **admin.fts-ksa.com**.
   - **App 2:**  
     - Root: path to `fts-employee`.  
     - Start command: `npm run start`.  
     - Subdomain: **employee.fts-ksa.com**.

4. Set **environment variables** for each app in the HosterPK panel (use the values from section 3).

5. Point **admin.fts-ksa.com** to the process running `fts-admin`, and **employee.fts-ksa.com** to the process running `fts-employee` (via proxy or port mapping in the panel).

### Option B: cPanel / "Node.js app" (if HosterPK uses cPanel"™s Node.js)

1. In cPanel â†’ **Setup Node.js App** (or similar).
2. **First app:**
   - Node version: e.g. 18 or 20.
   - Application root: folder containing `fts-admin` (e.g. `admin`).
   - Application URL: `admin.fts-ksa.com`.
   - Entry point: leave default or set to run `npm run start` after build.
   - Add env vars (same as section 3 for admin).
3. **Second app:**
   - Same steps for `fts-employee`, URL `employee.fts-ksa.com`, env vars for employee.
4. For each app: **Run npm install**, then **Run npm run build**, then start the app.

### Option C: Build locally and upload (VPS or Node.js hosting)

1. **Single combined folder "out" (recommended for zip â†’ HosterPK):**
   ```bash
   node scripts/build-out.js
   ```
   This builds both apps and creates:
   - **out/admin/**   "“ Admin portal (standalone + static + public )
   - **out/employee/** "“ Employee portal (standalone + static + public)
   - **out/README.txt** "“ Short instructions

   **Zip the `out` folder**, upload to your server, extract. On the server (VPS/Node host):
   - For admin: `cd out/admin && node server.js` (set env vars and PORT)
   - For employee: `cd out/employee && node server.js` (set env vars and PORT)
   Point each subdomain to the corresponding process (reverse proxy or port mapping).


2. Or build each app separately and upload each `.next/standalone` + static + public; run `node server.js` in each folder.

---

## 5. Checklist

| Item | Admin (admin.fts-ksa.com) | Employee (employee.fts-ksa.com) |
|------|----------------------------|----------------------------------|
| Codebase | `fts-admin` | `fts-employee` |
| Supabase URL | Same | Same |
| Supabase anon key | Same | Same |
| Service role key | Same | Same |
| Portal URL env | `NEXT_PUBLIC_APP_URL=https://admin.fts-ksa.com` | `NEXT_PUBLIC_ADMIN_PORTAL_URL=https://admin.fts-ksa.com` |
| SMTP / EMPLOYEE_PORTAL_URL | Set for admin app only | Not needed |
| Subdomain in Supabase redirect URLs | ✅ | ✅ |

---

## 6. After deployment

- **Admin:** open `https://admin.fts-ksa.com` â†’ login as a user (from Users).  
- **Employee:** open `https://employee.fts-ksa.com` â†’ login with an employee email.  
- Same users, same employees, same data; only the app and URL differ. No code or database structure changes are required.

If HosterPK uses a specific flow (e.g. "Deploy from Git" or a fixed folder structure), you can adapt the paths and start commands above to match; the env vars and "one database, two apps, two subdomains" setup stay the same.
