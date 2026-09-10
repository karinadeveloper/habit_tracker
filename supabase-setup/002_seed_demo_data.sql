-- =============================================================
-- Habit Tracker - Demo seed data
--
-- Run 001_schema_setup.sql first. This defines a reusable function
-- so the same seed logic can also be called by the pg_cron reset
-- job in 003_demo_limits_and_reset.sql.
--
-- The function is idempotent: it deletes any existing rows for the
-- given user_id before re-inserting, so it's safe to call more than
-- once for the same account.
-- =============================================================

create or replace function public.seed_demo_data(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  -- Clean slate for this user so the function can be re-run safely.
  delete from public.check_ins where user_id = p_user_id;
  delete from public.daily_wellness where user_id = p_user_id;
  delete from public.items where user_id = p_user_id;

  with new_items as (
    insert into public.items (user_id, title, type, goal, sort_order, is_active)
    values
      (p_user_id, 'Meditar 10 minutos', 'tema', null, 0, true),
      (p_user_id, 'Leer 20 páginas', 'libro', 20, 1, true),
      (p_user_id, 'Curso de inglés', 'curso', 15, 2, true),
      (p_user_id, 'Correr 5 km', 'tema', 12, 3, true),
      (p_user_id, 'Beber 2L de agua', 'tema', null, 4, true),
      (p_user_id, 'Practicar guitarra', 'tema', 18, 5, true)
    returning id, sort_order
  ),
  days as (
    select generate_series(current_date - interval '20 days', current_date, interval '1 day')::date as day
  )
  -- Roughly 2 out of every 3 days are checked off per item, offset by
  -- sort_order so items don't all show the exact same pattern.
  insert into public.check_ins (user_id, item_id, day, done)
  select p_user_id, ni.id, d.day, true
  from new_items ni
  cross join days d
  where mod((d.day - (current_date - interval '20 days')::date) + ni.sort_order, 3) <> 0;

  -- Mood cycles 2-5, sleep_hours cycles roughly 6.0-8.0h, for the
  -- last 14 days.
  insert into public.daily_wellness (user_id, day, mood, sleep_hours)
  select
    p_user_id,
    d.day,
    2 + mod((d.day - (current_date - interval '13 days')::date), 4),
    round((6 + mod((d.day - (current_date - interval '13 days')::date) * 3, 5) * 0.5)::numeric, 1)
  from (
    select generate_series(current_date - interval '13 days', current_date, interval '1 day')::date as day
  ) d;
end;
$$;

-- Run the seed for the demo account.
-- <<< REPLACE THIS UUID with the real demo user's id (auth.users.id)
--     before running -- the placeholder below will fail with a
--     foreign key violation since no such user exists. >>>
select public.seed_demo_data('00000000-0000-0000-0000-000000000000');
