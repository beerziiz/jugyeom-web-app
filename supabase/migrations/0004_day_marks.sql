-- Jugyeom: per-day results read from screenshots
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Some in-game screens only show today (check-in, guild war attacks, castle damage).
-- Officers read them on different days, and each day is kept here so the week's
-- misses add up and every miss traces back to a dated record.

create table public.day_marks (
  member_id       bigint   not null references public.members (id) on delete cascade,
  content_type_id smallint not null references public.content_types (id),
  day             date     not null,
  done            boolean,          -- attended that day; null when the screen did not say
  value           numeric,          -- damage that day, when the screen shows it
  updated_by      uuid references auth.users (id),
  updated_at      timestamptz not null default now(),
  primary key (member_id, content_type_id, day)
);

create index day_marks_day_idx on public.day_marks (day);

alter table public.day_marks enable row level security;

create policy "public read" on public.day_marks for select using (true);
create policy "officer write" on public.day_marks for all
  using (public.is_officer()) with check (public.is_officer());

create trigger day_marks_touch before update on public.day_marks
  for each row execute function public.touch_updated_at();
