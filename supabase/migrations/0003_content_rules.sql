-- Jugyeom: the guild's content rules
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Misses are attendance only. One "run" is one thing a member must show up for:
--   Guild War          3 days a week (Mon, Wed, Sat); a day counts when all 3 attacks are used
--   Castle Rush        7 days a week, one attack a day; damage recorded
--   Advent Expedition  every 2 weeks, two parts, one run each:
--                        4 bosses             — attacked at all; damage recorded per boss
--                        God of Destruction   — attacked at least 3 times; damage recorded
--                      Entered in the second (closing) week of each cycle, so those
--                      misses count toward that week's warning.
--   Check-in           7 days a week

-- Warning once a member misses 5 runs in one week.
alter table public.settings alter column miss_threshold set default 5;
update public.settings set miss_threshold = 5;

-- Content that runs on a multi-week cycle is entered only in the cycle's last week.
alter table public.content_types
  add column cycle_weeks smallint not null default 1 check (cycle_weeks between 1 and 8),
  add column cycle_start date,                    -- a Monday that starts a cycle
  add column score_parts smallint not null default 1 check (score_parts between 1 and 8);
                                                  -- damage fields per member, e.g. one per boss

-- Damage per part when score_parts > 1; entries.score keeps the total.
alter table public.entries add column score_parts numeric[];

update public.content_types
   set name_en = 'Guild War', name_th = 'สงครามกิลด์',
       has_score = false, score_label = null, default_runs = 3, sort_order = 1
 where key = 'guild_war';

update public.content_types
   set name_en = 'Castle Rush', name_th = 'สงครามชิงปราสาท',
       has_score = true, score_label = 'Damage', default_runs = 7, sort_order = 2
 where key = 'castle_rush';

update public.content_types
   set name_en = 'Advent Expedition: 4 Bosses', name_th = 'กลุ่มนักเดินทางจุติ: บอส 4 ตัว',
       has_score = true, score_label = 'Damage', default_runs = 1, sort_order = 3,
       cycle_weeks = 2, cycle_start = '2026-10-05', score_parts = 4
 where key = 'advent_expedition';

insert into public.content_types
  (key, name_en, name_th, has_score, score_label, sort_order, default_runs, cycle_weeks, cycle_start)
values
  ('advent_god', 'Advent Expedition: God of Destruction', 'กลุ่มนักเดินทางจุติ: เทพแห่งการทำลาย',
   true, 'Damage', 4, 1, 2, '2026-10-05')
on conflict (key) do nothing;

update public.content_types
   set name_en = 'Check-in', name_th = 'การเช็คชื่อ',
       has_score = false, score_label = null, default_runs = 7, sort_order = 5
 where key = 'checkin_donation';
