-- Candidate profile fields + job JD sections + screening questions
-- Project: tmcxeobmdzrmsyklzfmg

-- ---------------------------------------------------------------------------
-- Profiles: KSA + career history (manual entry)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists iqama_number text,
  add column if not exists iqama_expiry date,
  add column if not exists passport_number text,
  add column if not exists passport_expiry date,
  add column if not exists employment_status text
    check (
      employment_status is null
      or employment_status in (
        'employed',
        'unemployed',
        'notice_period',
        'student',
        'other'
      )
    ),
  add column if not exists current_employer text,
  add column if not exists current_job_title text,
  add column if not exists years_experience numeric(4, 1),
  add column if not exists education jsonb not null default '[]'::jsonb,
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists profile_updated_at timestamptz;

-- ---------------------------------------------------------------------------
-- Jobs: JD sections
-- ---------------------------------------------------------------------------
alter table public.jobs
  add column if not exists responsibilities text not null default '',
  add column if not exists requirements text not null default '',
  add column if not exists benefits text not null default '';

-- ---------------------------------------------------------------------------
-- Screening questions
-- ---------------------------------------------------------------------------
create table if not exists public.job_questions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  prompt text not null,
  input_type text not null default 'text'
    check (input_type in ('text', 'textarea', 'yes_no')),
  required boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists job_questions_job_id_idx
  on public.job_questions (job_id, sort_order);

create table if not exists public.application_answers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  question_id uuid not null references public.job_questions (id) on delete cascade,
  answer_text text not null default '',
  created_at timestamptz not null default now(),
  unique (application_id, question_id)
);

create index if not exists application_answers_app_idx
  on public.application_answers (application_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.job_questions enable row level security;
alter table public.application_answers enable row level security;

-- Questions: anyone can read questions for published jobs; HR full access
drop policy if exists "job_questions_select_published_or_hr" on public.job_questions;
create policy "job_questions_select_published_or_hr"
  on public.job_questions for select
  using (
    public.is_hr()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.status = 'published'
    )
  );

drop policy if exists "job_questions_hr_insert" on public.job_questions;
create policy "job_questions_hr_insert"
  on public.job_questions for insert
  with check (public.is_hr());

drop policy if exists "job_questions_hr_update" on public.job_questions;
create policy "job_questions_hr_update"
  on public.job_questions for update
  using (public.is_hr());

drop policy if exists "job_questions_hr_delete" on public.job_questions;
create policy "job_questions_hr_delete"
  on public.job_questions for delete
  using (public.is_hr());

-- Answers: own application or HR
drop policy if exists "application_answers_select_own_or_hr" on public.application_answers;
create policy "application_answers_select_own_or_hr"
  on public.application_answers for select
  using (
    public.is_hr()
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "application_answers_insert_own" on public.application_answers;
create policy "application_answers_insert_own"
  on public.application_answers for insert
  with check (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "application_answers_hr_all" on public.application_answers;
create policy "application_answers_hr_all"
  on public.application_answers for all
  using (public.is_hr())
  with check (public.is_hr());

-- Refresh public_jobs view with JD sections
-- Must DROP first: CREATE OR REPLACE cannot insert/rename middle columns.
drop view if exists public.public_jobs;

create view public.public_jobs
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
  responsibilities,
  requirements,
  benefits,
  published_at,
  created_at
from public.jobs
where status = 'published';

grant select on public.public_jobs to anon, authenticated;
