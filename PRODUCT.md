# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. Supabase for Postgres, Auth (officer accounts), and Storage (screenshots). Hosted on Vercel.

## Users

- **Guild leader and officers** of a Seven Knights Re:BIRTH (Global server) guild. They record each member's participation and performance once a week, review who is falling behind, and decide on warnings and removals. The project owner is the guild leader.
- **Guild members** (about 30) open a public link to see their own and the guild's performance and how many pieces of content they missed. They only read.

## Product Purpose

Give the guild one place to see member performance and a checklist counting missed guild content. Today this tracking has no shared home. The dashboard makes participation visible to everyone and gives leadership a fair, data-backed basis for warnings and kicks.

Success means officers can log a week of data for ~30 members quickly, every member can see where they stand without asking, and the kick list rests on recorded misses rather than memory.

## Positioning

A private, purpose-built tracker for this guild's own content and rules. It is not a general game wiki or stats site. It reflects how this guild judges participation.

## Operating Context

- Game: Seven Knights Re:BIRTH, Global server. The game has no public API, so all data is entered by hand or read from screenshots.
- Tracked guild content and what counts as one run (a miss is one run not done):
  - **Guild War / สงครามกิลด์**: 3 days a week (Mon, Wed, Sat), 3 attacks a day. A day counts only when all 3 attacks are used.
  - **Castle Rush / สงครามชิงปราสาท**: every day, 1 attack. Damage is recorded.
  - **Advent Expedition / กลุ่มนักเดินทางจุติ**: a 2-week cycle (first cycle starts Mon 5 Oct 2026), counted once per cycle in its second week. Attacks stock up by one a day to a cap of 10. Two parts, one run each:
    - **4 bosses**: attacked at all. Damage recorded per boss.
    - **God of Destruction / เทพแห่งการทำลาย**: attacked at least 3 times. Damage recorded.
  - **Check-in / การเช็คชื่อ**: every day.
- **Misses are judged on attendance only.** A member either took part in a run or missed it. Damage score is recorded for reference but never counts toward warnings.
- Cadence: officers enter data in a **weekly** batch.
- Data entry: **leader/officers enter it manually**, plus **screenshot reading**: officers upload an in-game screenshot per content, the app reads who took part and their damage score, and an officer confirms before saving.
- Members mostly check results on their phones after reset or when shared in guild chat (assumed, not confirmed).

## Capabilities and Constraints

- **Access:** public read-only link for everyone; only leader/officers sign in to create or edit data.
- **Performance view:** per-member performance across tracked content, plus a guild-wide overview.
- **Missed-content checklist:** per-member count of missed content, by content type and time period.
- **Warnings and kick list:** members are flagged once their misses in a **single week** reach an officer-set threshold (default 5). Repeat offenders go on a kick-candidate list. The final decision stays with officers.
- **Bilingual:** Thai and English, with a language switch.
- **History:** members who leave are kept forever (marked as left, never deleted), with all their entries and warnings.
- **Scale:** one guild, about 30 members. Multi-guild support is out of scope for now.
- **Decided:** misses count attendance only; warnings are judged per week; past members are kept forever; screenshot reading per content fills attendance and damage score, and an officer confirms it.
- **Open decisions:** how many warnings put a member on the kick list (currently 2).

## Brand Commitments

The product name is **Jugyeom**. No logo, guild emblem, or brand assets have been provided. Game names and art belong to the game's publisher, so do not use official game assets unless the user supplies and approves them.

## Evidence on Hand

None yet: no member roster, past data, screenshots, or guild assets are in the repo. Do not invent member names, scores, or guild stats outside clearly labelled placeholder or demo data.

## Product Principles

1. **Fairness through records.** Every warning or kick suggestion must trace back to specific logged misses.
2. **Fast for officers.** Weekly entry for ~30 members should take minutes. Batch entry and screenshot reading come before per-record forms.
3. **Glanceable for members.** A member should find their own status and miss count right away, on a phone, in either language.
4. **Officers decide.** The system flags and suggests; it never removes or punishes anyone automatically.

## Accessibility & Inclusion

Full Thai and English support, including Thai text rendering, line breaking, and longer strings. Public pages are read mostly on mobile.
