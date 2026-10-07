-- Clear all guild data. Run in the Supabase SQL editor.
-- Keeps officers (logins), content_types and settings (seeded config), so the
-- app still works afterwards. IDs restart from 1.

truncate table
  public.day_marks,
  public.period_contents,
  public.entries,
  public.warnings,
  public.screenshots,
  public.periods,
  public.members
restart identity cascade;

-- Screenshot files live in the "screenshots" storage bucket and are not
-- removed by this script: empty the bucket from Dashboard > Storage.

-- Optional full reset: also uncomment these to wipe officers and restore
-- settings to their defaults.
-- truncate table public.officers;
-- truncate table public.settings restart identity;
-- insert into public.settings default values;
