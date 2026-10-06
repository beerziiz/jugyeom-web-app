-- Jugyeom: initial schema
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Access model
--   anon (public link)      : read-only on everything members are allowed to see
--   authenticated officer   : read + write (must have a row in public.officers)

-- ─────────────────────────────────────────────────────────────
-- Officers (leader / officer accounts that may edit data)
-- ─────────────────────────────────────────────────────────────
create table public.officers (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique,
  role       text not null default 'officer' check (role in ('leader', 'officer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_officer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.officers where user_id = auth.uid());
$$;

-- ─────────────────────────────────────────────────────────────
-- Members
-- ─────────────────────────────────────────────────────────────
create table public.members (
  id         bigint generated always as identity primary key,
  ign        text not null,                       -- in-game name
  role       text not null default 'member'
             check (role in ('leader', 'officer', 'member')),
  joined_at  date not null default current_date,
  left_at    date,                                -- kept for history instead of deleting
  note       text,
  created_at timestamptz not null default now()
);

create unique index members_active_ign_idx
  on public.members (lower(ign)) where left_at is null;

-- ─────────────────────────────────────────────────────────────
-- Content types (Guild War, Castle Rush, …)
-- ─────────────────────────────────────────────────────────────
create table public.content_types (
  id          smallint generated always as identity primary key,
  key         text not null unique,
  name_en     text not null,
  name_th     text not null,
  has_score   boolean not null default true,      -- false = attendance only
  score_label text,                               -- e.g. 'Damage', 'Points'
  sort_order  smallint not null default 0,
  active      boolean not null default true
);

insert into public.content_types (key, name_en, name_th, has_score, score_label, sort_order) values
  ('guild_war',         'Guild War',         'กิลด์วอร์',              true,  'Score',  1),
  ('castle_rush',       'Castle Rush',       'บุกปราสาท',             true,  'Damage', 2),
  ('advent_expedition', 'Advent Expedition', 'แอดเวนต์ เอ็กซ์เปดิชัน', true,  'Damage', 3),
  ('checkin_donation',  'Check-in / Donation','เช็กอิน / บริจาค',     false, null,     4);

-- ─────────────────────────────────────────────────────────────
-- Periods (one row per week)
-- ─────────────────────────────────────────────────────────────
create table public.periods (
  id         bigint generated always as identity primary key,
  week_start date not null unique,                -- Monday of the game week
  season     text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Entries: one row per member × week × content
-- ─────────────────────────────────────────────────────────────
create table public.entries (
  id              bigint generated always as identity primary key,
  member_id       bigint not null references public.members (id) on delete cascade,
  period_id       bigint not null references public.periods (id) on delete cascade,
  content_type_id smallint not null references public.content_types (id),
  participated    boolean not null default false,
  missed_count    smallint not null default 0 check (missed_count >= 0),
                  -- how many runs/days of this content were missed this week
  score           numeric,                        -- score / damage, null if n/a
  note            text,
  source          text not null default 'manual' check (source in ('manual', 'screenshot')),
  entered_by      uuid references auth.users (id),
  updated_at      timestamptz not null default now(),
  unique (member_id, period_id, content_type_id)
);

create index entries_period_idx on public.entries (period_id);
create index entries_member_idx on public.entries (member_id);

-- ─────────────────────────────────────────────────────────────
-- Settings (single row)
-- ─────────────────────────────────────────────────────────────
create table public.settings (
  id                   boolean primary key default true check (id),
  miss_threshold       smallint not null default 3,   -- misses in one week → warning
  kick_after_warnings  smallint not null default 2,   -- warnings → kick candidate
  updated_at           timestamptz not null default now()
);

insert into public.settings default values;

-- ─────────────────────────────────────────────────────────────
-- Warnings (officer-confirmed records)
-- ─────────────────────────────────────────────────────────────
create table public.warnings (
  id         bigint generated always as identity primary key,
  member_id  bigint not null references public.members (id) on delete cascade,
  period_id  bigint not null references public.periods (id) on delete cascade,
  misses     smallint not null,
  reason     text,
  status     text not null default 'open' check (status in ('open', 'cleared', 'kicked')),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  unique (member_id, period_id)
);

-- ─────────────────────────────────────────────────────────────
-- Screenshots (uploaded for number extraction; reviewed before saving)
-- ─────────────────────────────────────────────────────────────
create table public.screenshots (
  id              bigint generated always as identity primary key,
  period_id       bigint references public.periods (id) on delete set null,
  content_type_id smallint references public.content_types (id),
  storage_path    text not null,
  parsed_json     jsonb,
  confirmed_by    uuid references auth.users (id),
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Views
-- ─────────────────────────────────────────────────────────────

-- Misses per member per week. Every flag traces back to entries rows.
create view public.weekly_misses
with (security_invoker = true) as
select
  e.member_id,
  e.period_id,
  p.week_start,
  sum(e.missed_count)::int                                    as misses,
  sum(e.missed_count) >= (select miss_threshold from public.settings) as over_threshold
from public.entries e
join public.periods p on p.id = e.period_id
group by e.member_id, e.period_id, p.week_start;

-- Members whose open/kicked warnings reached the kick threshold.
create view public.kick_candidates
with (security_invoker = true) as
select
  m.id   as member_id,
  m.ign,
  count(w.id)::int as warning_count
from public.members m
join public.warnings w on w.member_id = m.id and w.status <> 'cleared'
where m.left_at is null
group by m.id, m.ign
having count(w.id) >= (select kick_after_warnings from public.settings);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.officers      enable row level security;
alter table public.members       enable row level security;
alter table public.content_types enable row level security;
alter table public.periods       enable row level security;
alter table public.entries       enable row level security;
alter table public.settings      enable row level security;
alter table public.warnings      enable row level security;
alter table public.screenshots   enable row level security;

-- Public read
create policy "public read" on public.members       for select using (true);
create policy "public read" on public.content_types for select using (true);
create policy "public read" on public.periods       for select using (true);
create policy "public read" on public.entries       for select using (true);
create policy "public read" on public.settings      for select using (true);
create policy "public read" on public.warnings      for select using (true);

-- Officers: officers can see the officer list; nobody edits it from the app
create policy "officer read" on public.officers for select using (public.is_officer());

-- Officer write
create policy "officer write" on public.members       for all using (public.is_officer()) with check (public.is_officer());
create policy "officer write" on public.content_types for all using (public.is_officer()) with check (public.is_officer());
create policy "officer write" on public.periods       for all using (public.is_officer()) with check (public.is_officer());
create policy "officer write" on public.entries       for all using (public.is_officer()) with check (public.is_officer());
create policy "officer write" on public.settings      for all using (public.is_officer()) with check (public.is_officer());
create policy "officer write" on public.warnings      for all using (public.is_officer()) with check (public.is_officer());
create policy "officer all"   on public.screenshots   for all using (public.is_officer()) with check (public.is_officer());

-- Keep updated_at fresh on entries
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for screenshots (private, officers only)
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('screenshots', 'screenshots', false)
  on conflict (id) do nothing;

create policy "officer screenshots" on storage.objects for all
  using (bucket_id = 'screenshots' and public.is_officer())
  with check (bucket_id = 'screenshots' and public.is_officer());
