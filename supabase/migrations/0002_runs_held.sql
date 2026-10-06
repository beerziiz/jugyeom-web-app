-- Jugyeom: runs held per content per week
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Officers record how many runs of each content were held in a week, so the
-- site can show "missed 1 of 7" and draw one seal per run.

-- Usual number of runs per week, used to pre-fill a new week.
alter table public.content_types
  add column default_runs smallint not null default 1 check (default_runs between 1 and 31);

update public.content_types set default_runs = 3 where key = 'guild_war';
update public.content_types set default_runs = 7 where key = 'castle_rush';
update public.content_types set default_runs = 2 where key = 'advent_expedition';
update public.content_types set default_runs = 7 where key = 'checkin_donation';

-- Runs actually held in a given week.
create table public.period_contents (
  period_id       bigint   not null references public.periods (id) on delete cascade,
  content_type_id smallint not null references public.content_types (id),
  runs_held       smallint not null check (runs_held between 0 and 31),
  primary key (period_id, content_type_id)
);

alter table public.period_contents enable row level security;

create policy "public read" on public.period_contents for select using (true);
create policy "officer write" on public.period_contents for all
  using (public.is_officer()) with check (public.is_officer());
