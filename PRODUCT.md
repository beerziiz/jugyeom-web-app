# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js / React (user's choice). Hosting, database, and auth provider are not decided yet.

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
- Tracked guild content (per the user): **Guild War**, **Castle Rush**, **Advent Expedition**, **daily check-in / donation**. Exact in-game names, schedules, and scoring metrics for each are still to be confirmed.
- Cadence: officers enter data in a **weekly** batch.
- Data entry: **leader/officers enter it manually**, plus **screenshot reading** (upload in-game screenshots and pull the numbers out).
- Members mostly check results on their phones after reset or when shared in guild chat (assumed, not confirmed).

## Capabilities and Constraints

- **Access:** public read-only link for everyone; only leader/officers sign in to create or edit data.
- **Performance view:** per-member performance across tracked content, plus a guild-wide overview.
- **Missed-content checklist:** per-member count of missed content, by content type and time period.
- **Warnings and kick list:** members are flagged once misses pass an officer-set threshold. Repeat offenders go on a kick-candidate list. The final decision stays with officers.
- **Bilingual:** Thai and English, with a language switch.
- **Scale:** one guild, about 30 members. Multi-guild support is out of scope for now.
- **Open decisions:** the exact metrics per content type (damage, score, rank, or attendance only); warning threshold defaults and period (week or season); whether past members and history are kept; how far screenshot reading is automated versus officer-confirmed.

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
