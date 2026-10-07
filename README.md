# jugyeom-web-app

create for check list miss of content member dashboard.

**Jugyeom** is a guild tracker for Seven Knights Re:BIRTH (Global). Officers log weekly participation and scores, and members open a public link to see their misses and status. Thai and English.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase: Postgres, Auth (officer username + password), Storage (screenshots)
- Vercel for hosting

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key
   (Supabase → Project Settings → API).
3. In Supabase → SQL Editor, run each file in `supabase/migrations/` in order (0001, 0002, 0003, …).
4. Create an officer: see `supabase/create-officer.sql`.
5. `npm run dev` and open http://localhost:3000. Officers sign in at `/login`.

## Structure

```
src/app/page.tsx         public guild overview
src/app/login/           officer sign-in (username → <username>@jugyeom.local)
src/app/admin/           officer area
src/lib/supabase/        server and browser Supabase clients
src/lib/i18n/            Thai / English dictionaries and language switch
src/proxy.ts             session refresh and /admin redirect
supabase/migrations/     database schema and access rules
```
