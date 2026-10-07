---
version: 1
slug: "src-app-public-page-tsx"
primary_target: "src/app/(public)/page.tsx"
related_targets: ["src/app/(public)/m/[id]/page.tsx"]
---

# Public guild board and member pages

Mode: Operate. Visitors are ~30 guild members opening a Discord link on their phone after weekly reset, asking "am I OK this week?". They read only.

Job: own status (misses x of limit, OK or warned, misses left) within seconds, then the fully open guild board. Every warning traces to logged misses, shown as marks.

Scope: `/` guild board, `/m/[id]` member page with week history, first-visit name picker (cookie, no login), Discord OG card. Officer pages adopt the same tokens, content colours and score bug but keep their working layout.

Decisions: dark is the default theme; the user rejected green (2026-10-07 redesign). Officers record runs held per content per week plus missed count; marks fill left to right (no per-run identity). User-confirmed mark semantics: filled = attended (in the content colour), red outline = missed; the allowance row counts down misses still allowed (white) and turns red outline as they are used.

Approved reference: `.impeccable/mocks/redesign-dark.html`, option A, "เติมสี = เข้า" (allowance counts misses left before a warning; a warned week turns every used plate solid red).

Open: none.

## Direction contract

THESIS: The guild board as an esports match broadcast graphic: each member is a player card with a score bug, and a week reads like a series score of slanted plates. Refuses the stat-tile bot dashboard, the ranked leaderboard table, and the old green notice-board look.

OWN-WORLD: Near-black indigo ground, indigo panels, live gold for the score bug, "you" and pressable things, miss red reserved for misses and warnings, cyan for clean. Kanit heavy italic for names and headings, Anuphan for UI and numbers. Slanted plates (skewX -18deg) as the only mark shape; one flat colour per content type.

STORY: Member taps the Discord link, sees the score bug with the week, picks or sees their player card with a big missed/limit score and "2 left" lives row, reads each content's plates, scans who is warned, opens anyone's card and their past weeks.

FIRST VIEWPORT: Header with gold JUGYEOM plate plus week plate, language at right, huge italic "กระดานกิลด์". Below, left column: the visitor's player card (name, big score, allowance lives, verdict strip, content rows with plates, legend), week chips; right column: warned cards then the rest, 2–3 columns.

FORM: Match Broadcast, position 5 on the grounded list (assigned by roll), seed key 55eacd09. Signature move: series-score plates (attended filled in content colour, missed as red outline gap, allowance lives counting down). Raises kept: hierarchy by scale contrast (big score numeral, from the type specimen), nothing disappears it cancels (misses stay as gaps, from the ticket wallet).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
