-- =============================================================
-- Habit Tracker - Demo account item cap + pg_cron reset
--
-- Run 001_schema_setup.sql and 002_seed_demo_data.sql first (this
-- file calls public.seed_demo_data(), defined in 002).
--
-- Demo accounts are registered in public.demo_accounts instead of
-- hardcoding the user id in several places -- add/remove rows there
-- to control which accounts are capped and auto-reset.
--
-- PROPOSED NUMBER (adjust if you disagree): max 8 active items per
-- demo account -- enough to show a populated dashboard without
-- letting a demo session grow unbounded.
-- =============================================================

create table if not exists public.demo_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  max_items integer not null default 8,
  created_at timestamptz not null default now()
);

-- <<< REPLACE THIS UUID with the real demo user's id (auth.users.id)
--     before running -- the placeholder below will fail with a
--     foreign key violation since no such user exists. >>>
insert into public.demo_accounts (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;

-- ---------- Trigger: cap items per demo account ----------
create or replace function public.enforce_demo_item_limit()
returns trigger
language plpgsql
as $$
declare
  v_max integer;
  v_count integer;
begin
  select max_items into v_max from public.demo_accounts where user_id = new.user_id;

  if v_max is not null then
    select count(*) into v_count
    from public.items
    where user_id = new.user_id and deleted_at is null;

    if v_count >= v_max then
      raise exception 'Demo account reached the limit of % active items', v_max;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_demo_item_limit on public.items;
create trigger trg_enforce_demo_item_limit
  before insert on public.items
  for each row execute function public.enforce_demo_item_limit();

-- ---------- pg_cron: wipe + reseed every 6 hours ----------
create extension if not exists pg_cron;
-- If the line above fails with a permissions error, enable pg_cron
-- from the Supabase dashboard first: Database -> Extensions -> pg_cron.

create or replace function public.reset_demo_accounts()
returns void
language plpgsql
as $$
declare
  r record;
begin
  for r in select user_id from public.demo_accounts loop
    perform public.seed_demo_data(r.user_id);
  end loop;
end;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'reset-demo-accounts') then
    perform cron.unschedule('reset-demo-accounts');
  end if;
end $$;

select cron.schedule(
  'reset-demo-accounts',
  '0 */6 * * *',
  $$select public.reset_demo_accounts();$$
);
