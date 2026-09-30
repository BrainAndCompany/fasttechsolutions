-- FTS Job Portal schema (dedicated Supabase project)
-- Project: tmcxeobmdzrmsyklzfmg

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (candidates + HR)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'candidate'
    check (role in ('candidate', 'hr', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  department text,
  location text,
  employment_type text not null default 'full_time'
    check (employment_type in ('full_time', 'part_time', 'contract', 'temporary')),
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed')),
  created_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_published_at_idx on public.jobs (published_at desc);

-- ---------------------------------------------------------------------------
-- Applications
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  cover_note text,
  cv_path text not null,
  cv_file_name text,
  status text not null default 'submitted'
    check (
      status in (
        'submitted',
        'under_review',
        'interview',
        'offer',
        'hired',
        'rejected',
        'withdrawn'
      )
    ),
  hr_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, user_id)
);

create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_status_idx on public.applications (status);

-- ---------------------------------------------------------------------------
-- Application status history
-- ---------------------------------------------------------------------------
create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists application_events_app_idx
  on public.application_events (application_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

create or replace function public.is_hr()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('hr', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Signup is always candidate; HR/admin only via SQL update on profiles.
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'candidate'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;

-- Profiles
drop policy if exists "profiles_select_own_or_hr" on public.profiles;
create policy "profiles_select_own_or_hr"
  on public.profiles for select
  using (id = auth.uid() or public.is_hr());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_hr_update" on public.profiles;
create policy "profiles_hr_update"
  on public.profiles for update
  using (public.is_hr());

-- Jobs: public can read published; HR full access
drop policy if exists "jobs_public_read_published" on public.jobs;
create policy "jobs_public_read_published"
  on public.jobs for select
  using (status = 'published' or public.is_hr());

drop policy if exists "jobs_hr_insert" on public.jobs;
create policy "jobs_hr_insert"
  on public.jobs for insert
  with check (public.is_hr());

drop policy if exists "jobs_hr_update" on public.jobs;
create policy "jobs_hr_update"
  on public.jobs for update
  using (public.is_hr());

drop policy if exists "jobs_hr_delete" on public.jobs;
create policy "jobs_hr_delete"
  on public.jobs for delete
  using (public.is_hr());

-- Applications
drop policy if exists "applications_select_own_or_hr" on public.applications;
create policy "applications_select_own_or_hr"
  on public.applications for select
  using (user_id = auth.uid() or public.is_hr());

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.jobs j
      where j.id = job_id and j.status = 'published'
    )
  );

drop policy if exists "applications_update_own_withdraw" on public.applications;
create policy "applications_update_own_withdraw"
  on public.applications for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and status = 'withdrawn'
  );

drop policy if exists "applications_hr_update" on public.applications;
create policy "applications_hr_update"
  on public.applications for update
  using (public.is_hr());

-- Events
drop policy if exists "events_select_own_or_hr" on public.application_events;
create policy "events_select_own_or_hr"
  on public.application_events for select
  using (
    public.is_hr()
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "events_insert_hr_or_system" on public.application_events;
create policy "events_insert_hr_or_system"
  on public.application_events for insert
  with check (
    public.is_hr()
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: private CVs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cvs',
  'cvs',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cvs_insert_own" on storage.objects;
create policy "cvs_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "cvs_select_own_or_hr" on storage.objects;
create policy "cvs_select_own_or_hr"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_hr()
    )
  );

drop policy if exists "cvs_delete_own_or_hr" on storage.objects;
create policy "cvs_delete_own_or_hr"
  on storage.objects for delete
  using (
    bucket_id = 'cvs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_hr()
    )
  );

-- Public view for marketing site (published jobs only, no PII)
create or replace view public.public_jobs
with (security_invoker = true)
as
select
  id,
  title,
  slug,
  department,
  location,
  employment_type,
  description,
  published_at,
  created_at
from public.jobs
where status = 'published';

grant select on public.public_jobs to anon, authenticated;
