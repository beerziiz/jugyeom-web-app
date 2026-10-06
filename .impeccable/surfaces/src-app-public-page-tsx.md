---
version: 1
slug: "src-app-public-page-tsx"
primary_target: "src/app/(public)/page.tsx"
related_targets: ["src/app/(public)/m/[id]/page.tsx"]
---

# Public guild board and member pages

Mode: Operate. Visitors are ~30 guild members opening a Discord link on their phone after weekly reset, asking "am I OK this week?". They read only.

Job: own status (misses x of limit, OK or warned, misses left) within seconds, then the fully open guild board. Every warning traces to logged misses, shown as seals.

Scope: `/` guild board, `/m/[id]` member page with week history, first-visit name picker (cookie, no login), Discord OG card. Officer pages adopt the same tokens and content colours but keep their working layout.

Decisions: dark is the default theme. Officers record runs held per content per week plus missed count; seals fill left to right (no per-run identity).

Open: none.

## Direction contract

THESIS: The guild board as a guild-hall notice board at night: each member's week is a pinned notice and every missed run is a red wax seal pressed onto it. Refuses the stat-tile bot dashboard and the ranked leaderboard table as the first thing a member sees.

OWN-WORLD: Dark stone ground tinted green, deep banner-green pennant header, warm-dark notice paper, brass pin heads, wax-seal red reserved for misses and warnings. Trirong (Thai serif) for names and headings, Anuphan for UI and numbers. One flat colour per content type, identical on every screen. Hollow circle = attended run, filled seal = missed, a hard rule marks the limit.

STORY: Member taps the Discord link, sees their own pinned notice with seals per content and "1 more miss before a warning", scrubs back through recent weeks, scans who is warned, opens anyone's notice. They believe the records are fair because every warning is visible seals.

FIRST VIEWPORT: Pennant banner header (Jugyeom, week range, language). Directly below, the visitor's notice fills the width: name in Trirong, verdict strip, four content rows each with colour key, score, seal row, then the limit bar. Week scrubber chips under it; warned notices begin at the fold.

FORM: Guild Hall Board, position 4 on the grounded list (assigned by roll), seed key ebe2d0ca. Signature move: wax seals as the miss counter. Raises kept: states as marks (centre rail), one colour per content (guide map), capacity runs held vs attended with limit line (j-card), week scrubber re-pins the board (specimen).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
