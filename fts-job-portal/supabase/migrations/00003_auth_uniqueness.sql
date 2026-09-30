-- Auth uniqueness helpers + unique phone/email for candidates

-- Normalize empty phones to null
update public.profiles
set phone = null
where phone is not null and btrim(phone) = '';

-- One account per email (case-insensitive)
create unique index if not exists profiles_email_lower_unique
  on public.profiles (lower(btrim(email)));

-- One account per phone (when provided)
create unique index if not exists profiles_phone_unique
  on public.profiles (phone)
  where phone is not null and phone <> '';

-- Callable by anon signup / forgot-password (no full profile leak)
create or replace function public.is_email_registered(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where lower(btrim(email)) = lower(btrim(p_email))
  );
$$;

create or replace function public.is_phone_registered(p_phone text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where phone is not null
      and phone <> ''
      and regexp_replace(phone, '[^0-9+]', '', 'g')
          = regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g')
  );
$$;

grant execute on function public.is_email_registered(text) to anon, authenticated;
grant execute on function public.is_phone_registered(text) to anon, authenticated;
