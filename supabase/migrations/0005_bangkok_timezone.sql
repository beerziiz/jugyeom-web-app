-- Jugyeom: show times in Bangkok time
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Every time column is timestamptz, which stores an instant and shows it in the
-- session's time zone. This makes new sessions show +07:00 instead of UTC.
-- Stored values do not change; reconnect to see the new zone.

alter database postgres set timezone to 'Asia/Bangkok';
