-- Make an existing Supabase Auth user an officer.
--
-- 1. Dashboard → Authentication → Users → Add user → Create new user
--      Email:    <username>@jugyeom.local   (e.g. beerziiz@jugyeom.local)
--      Password: <their password>
--      ✔ Auto Confirm User
-- 2. Edit the username and role below, then run this in the SQL Editor.
--    Officers sign in on the site with just the username + password.

insert into public.officers (user_id, username, role)
select id, 'beerziiz', 'leader'          -- ← change username / role
from auth.users
where email = 'beerziiz@jugyeom.local';  -- ← must match the email from step 1
