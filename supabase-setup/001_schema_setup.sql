-- =============================================================
-- Habit Tracker - Schema setup (idempotent)
--
-- Reconstructed from application code (lib/database.types.ts,
-- lib/db.native.ts, lib/backgrounds.ts, hooks/*.ts), because this
-- repository has no SQL migrations and this session has no access
-- to the live Supabase project. See the assumptions below and the
-- inline "-- ASSUMPTION:" comments before running this against a
-- real project.
--
-- UNVERIFIED ASSUMPTIONS (could not be confirmed from client code):
--   1. Exact names of RLS policies and of the profile-creation
--      trigger/function (never exposed to the client).
--   2. Valid range for daily_wellness.mood and .sleep_hours
--      (assumed 1-5 and 0-24; adjust if the UI uses another scale).
--   3. The partial unique index on check_ins is inferred from the
--      soft-delete pattern (deleted_at) used across the app. The
--      local SQLite mirror (lib/db.native.ts) has a plain UNIQUE
--      index with no WHERE clause; here it is corrected to a
--      partial index so a soft-deleted check-in can be re-created
--      for the same item/day without a uniqueness violation.
--   4. profiles.background_key defaults to 'noche' because it is
--      the first key defined in lib/backgrounds.ts.
--
-- Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS before
-- recreating objects that don't support IF NOT EXISTS (policies,
-- triggers).
-- =============================================================

-- ---------- Extensions ----------
-- gen_random_uuid() is built into Postgres 13+, but Supabase
-- projects commonly still enable pgcrypto explicitly; harmless if
-- it's already available.
create extension if not exists pgcrypto with schema extensions;

-- ---------- Table: profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  background_key text not null default 'noche'
    constraint profiles_background_key_check
    check (background_key in ('noche', 'playa', 'salvia')),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

-- ---------- Table: items ----------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  type text not null
    constraint items_type_check check (type in ('libro', 'curso', 'tema')),
  goal integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- Table: check_ins ----------
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  day date not null,
  done boolean not null default true,
  value numeric,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- Table: daily_wellness ----------
create table if not exists public.daily_wellness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  -- ASSUMPTION: 1-5 mood scale, not verified anywhere in the client code.
  mood smallint
    constraint daily_wellness_mood_check check (mood between 1 and 5),
  -- ASSUMPTION: 0-24 hour range, not verified anywhere in the client code.
  sleep_hours numeric(3, 1)
    constraint daily_wellness_sleep_hours_check check (sleep_hours between 0 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- Indexes ----------
-- Mirrors lib/db.native.ts's idx_checkins_item_day, but made PARTIAL
-- (WHERE deleted_at IS NULL) so re-checking a previously soft-deleted
-- check-in doesn't collide with its own deleted row.
create unique index if not exists check_ins_item_day_active_idx
  on public.check_ins (item_id, day)
  where deleted_at is null;

-- Mirrors lib/db.native.ts's idx_checkins_day.
create index if not exists check_ins_day_idx on public.check_ins (day);

-- Mirrors lib/db.native.ts's idx_items_user.
create index if not exists items_user_id_idx on public.items (user_id);

-- Not present in the local SQLite mirror (daily_wellness doesn't exist
-- there yet) -- ADDED here for data integrity, by analogy with
-- check_ins: one active wellness entry per user per day. Drop it on
-- review if that's not the intended behavior.
create unique index if not exists daily_wellness_user_day_active_idx
  on public.daily_wellness (user_id, day)
  where deleted_at is null;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.check_ins enable row level security;
alter table public.daily_wellness enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can view their own items" on public.items;
create policy "Users can view their own items" on public.items
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own items" on public.items;
create policy "Users can insert their own items" on public.items
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own items" on public.items;
create policy "Users can update their own items" on public.items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own items" on public.items;
create policy "Users can delete their own items" on public.items
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own check-ins" on public.check_ins;
create policy "Users can view their own check-ins" on public.check_ins
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own check-ins" on public.check_ins;
create policy "Users can insert their own check-ins" on public.check_ins
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own check-ins" on public.check_ins;
create policy "Users can update their own check-ins" on public.check_ins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own check-ins" on public.check_ins;
create policy "Users can delete their own check-ins" on public.check_ins
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own wellness entries" on public.daily_wellness;
create policy "Users can view their own wellness entries" on public.daily_wellness
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own wellness entries" on public.daily_wellness;
create policy "Users can insert their own wellness entries" on public.daily_wellness
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own wellness entries" on public.daily_wellness;
create policy "Users can update their own wellness entries" on public.daily_wellness
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own wellness entries" on public.daily_wellness;
create policy "Users can delete their own wellness entries" on public.daily_wellness
  for delete using (auth.uid() = user_id);

-- ---------- Trigger: create profile on signup ----------
-- ASSUMPTION: default values (null display_name, 'noche' background,
-- 'UTC' timezone) since signUp() in hooks/useAuth.ts sends no
-- metadata (see app/login.tsx / hooks/useAuth.ts: only email+password).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, background_key, timezone, created_at)
  values (new.id, null, 'noche', 'UTC', now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
