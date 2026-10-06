---
name: Jugyeom
description: Guild hall notice board for a Seven Knights Re:BIRTH guild; weekly misses pressed as wax seals.
colors:
  stone: "oklch(0.17 0.012 160)"
  bone-ink: "oklch(0.93 0.012 85)"
  notice-paper: "oklch(0.215 0.012 120)"
  notice-paper-raised: "oklch(0.255 0.014 130)"
  hall-rule: "oklch(0.32 0.016 140)"
  faded-ink: "oklch(0.72 0.014 100)"
  banner-green: "oklch(0.36 0.07 160)"
  banner-ink: "oklch(0.96 0.012 150)"
  brass: "oklch(0.76 0.13 88)"
  brass-deep: "oklch(0.55 0.11 80)"
  brass-ink: "oklch(0.2 0.03 80)"
  seal-red: "oklch(0.6 0.19 28)"
  seal-red-deep: "oklch(0.42 0.15 27)"
  seal-wash: "oklch(0.6 0.19 28 / 0.14)"
  seal-lip: "oklch(0.8 0.12 35)"
  seal-empty: "oklch(0.5 0.015 100)"
  clear-green: "oklch(0.78 0.12 155)"
  content-guild-war: "oklch(0.7 0.12 250)"
  content-castle-rush: "oklch(0.72 0.11 70)"
  content-advent: "oklch(0.7 0.12 300)"
  content-checkin: "oklch(0.74 0.12 155)"
typography:
  display:
    fontFamily: "Trirong, serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "Trirong, serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Trirong, serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  title-small:
    fontFamily: "Trirong, serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  body-strong:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label-small:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  key: "2px"
  mini-notice: "3px"
  strip: "4px"
  notice: "5px"
  control: "6px"
  menu: "8px"
  pill: "9999px"
spacing:
  seal-gap: "5px"
  board-gap: "12px"
  gutter: "16px"
  notice-x: "20px"
  notice-top: "28px"
  section: "32px"
  column-gap: "40px"
components:
  notice:
    backgroundColor: "{colors.notice-paper}"
    textColor: "{colors.bone-ink}"
    rounded: "{rounded.notice}"
    padding: "28px 20px 20px"
  mini-notice:
    backgroundColor: "{colors.notice-paper}"
    textColor: "{colors.bone-ink}"
    rounded: "{rounded.mini-notice}"
    padding: "14px 12px 12px"
  mini-notice-hover:
    backgroundColor: "{colors.notice-paper-raised}"
  verdict-strip:
    backgroundColor: "{colors.notice-paper-raised}"
    textColor: "{colors.bone-ink}"
    rounded: "{rounded.strip}"
    padding: "10px 12px"
  verdict-strip-warn:
    backgroundColor: "{colors.seal-wash}"
    textColor: "{colors.seal-red}"
  week-chip:
    backgroundColor: "{colors.notice-paper}"
    textColor: "{colors.faded-ink}"
    typography: "{typography.label-small}"
    rounded: "{rounded.strip}"
    padding: "8px"
  week-chip-active:
    backgroundColor: "{colors.banner-green}"
    textColor: "{colors.banner-ink}"
  name-pill:
    backgroundColor: "{colors.notice-paper-raised}"
    textColor: "{colors.bone-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  pennant-header:
    backgroundColor: "{colors.banner-green}"
    textColor: "{colors.banner-ink}"
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.brass-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.notice-paper}"
    textColor: "{colors.bone-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.notice-paper-raised}"
  button-quiet:
    textColor: "{colors.faded-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 8px"
  field:
    backgroundColor: "{colors.notice-paper}"
    textColor: "{colors.bone-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: Jugyeom

## Overview

**Creative North Star: "The Night Hall Notice Board"**

Jugyeom is a guild hall at night. The page is dark stone tinted green; a banner-green pennant hangs across the top with a notched lower edge; each member's week is a warm-dark paper notice held by a brass pin; every missed run is a red wax seal pressed onto that notice. The world is physical and quiet: paper, brass, wax, stone. Nothing glows, nothing is a chart, and no number appears without the seals that justify it.

Density is low on the public side (one large notice, then a grid of small ones) and plain on the officer side, which uses the same tokens, content colours, and Trirong headings in an ordinary working layout of header, tabs, fields, and tables. Dark ("night hall") is the shipped default. A light "day hall" token set exists under `:root[data-theme="light"]` for a future switch; nothing toggles it yet, so treat it as provisional.

The world rejects the stat-tile bot dashboard and the ranked leaderboard table as the first thing a member sees.

**Key Characteristics:**
- Wax seals are the miss counter: filled seal = missed run, hollow ring = attended run, a hard vertical rule marks the limit.
- Seal red belongs only to misses, warnings, and over-limit states.
- One flat colour per content type, identical on every screen.
- Notices are paper: brass pin at top centre, soft drop shadow, small radii, slight off-true rotation on the board.
- Trirong (Thai serif) for names and headings; Anuphan for UI and every number, with tabular figures.

## Colors

A low-chroma stone-and-paper ground with three charged materials: banner green, brass, and seal red.

### Primary
- **Banner Green** (banner-green): the pennant header, the active week chip. Text on it is Banner Ink.

### Secondary
- **Brass** (brass): pin heads, the focus outline, caret and native accent colour, text selection (at 35% alpha), the primary officer button, the "this is you" highlight ring on a mini notice, hover state of name pills. Brass Deep is the shadow side of the pin gradient. Text on brass is Brass Ink.

### Tertiary
- **Seal Red** (seal-red): the body of a wax seal, warned counts, over-limit rings (2px), warning text. Seal Red Deep is the pressed inner ring and rim stroke; Seal Lip is the highlight ring and stamped J; Seal Wash is the background of a warning verdict strip. Seal Empty is the hollow attended-run ring.
- **Clear Green** (clear-green): the "clean week" verdict and the "no one warned" line only.

### Content colours
- **Guild War** (content-guild-war, blue), **Castle Rush** (content-castle-rush, amber), **Advent Expedition** (content-advent, violet), **Check-in / Donation** (content-checkin, green). Mapped by content key in one place; unknown keys fall back to Faded Ink. Shown as a 10px square key with 2px corners beside the content name.

### Neutral
- **Stone** (stone): page background and scrollbar track.
- **Notice Paper** (notice-paper): notices, mini notices, officer fields, header bar on officer pages, idle week chips.
- **Notice Paper Raised** (notice-paper-raised): verdict strips, hover state on paper, name pills, active history row.
- **Hall Rule** (hall-rule): borders, dashed row dividers inside a notice, scrollbar thumb.
- **Faded Ink** (faded-ink): roles, counts, secondary text, quiet buttons.
- **Bone Ink** (bone-ink): primary text, and the limit rule in the seal row.

### Named Rules
**The Wax Is Evidence Rule.** Seal red appears only where a miss, a warning, or an over-limit state is being shown. It is never decoration, never a brand accent, never a button.

**The One Colour Per Content Rule.** Each content type has exactly one flat colour, read from the shared map, and it is the same on the board, member page, and officer entry grid.

**The Brass Means Touch Rule.** Brass marks pins, focus, and the thing you act on or are; it does not tint panels or text blocks.

## Typography

**Display Font:** Trirong (with serif), weights 600 and 700 loaded
**Body Font:** Anuphan (with system-ui, sans-serif), weights 400 to 700 loaded

**Character:** A Thai serif with carved, signboard weight for names and headings against a clean Thai/Latin sans for everything read or counted. Body text uses strict Thai line breaking and tabular numerals globally.

### Hierarchy
- **Display** (Trirong 700, 2rem, 1.25): the page title inside the pennant.
- **Headline** (Trirong 700, 1.6rem, 1.25): the member name on a large notice; officer page titles sit close to this at 1.5rem.
- **Title** (Trirong 700, 1.25rem): section headings on the board ("warned", "everyone", "history"), followed by an Anuphan count in faded ink or seal red.
- **Title Small** (Trirong 700, 1.05rem): names on mini notices.
- **Body** (Anuphan 400, 1rem): general text, verdict strip.
- **Body Strong** (Anuphan 600, 0.95rem): content names in notice rows; the missed-of count in the verdict strip.
- **Label** (Anuphan 400, 0.875rem): roles, scores, controls, officer navigation (500).
- **Label Small** (Anuphan 400, 0.75rem): week chips, mini notice counts, history verdicts.

### Named Rules
**The Names Are Carved Rule.** People's names and section headings are Trirong bold; numbers, counts, and controls are never Trirong. The only Trirong inside a seal is the stamped J.

**The Sentence Case Rule.** No uppercase labels or letter-spaced captions; Thai has no case, and the system does not fake one for English.

## Layout

Public pages centre a 64rem (max-w-5xl) column with 16px side gutters; officer pages use 72rem (max-w-6xl). From the lg breakpoint the public page becomes two columns: a sticky left column up to 26rem holding the visitor's notice and the week scrubber, and a fluid right column for the board, separated by a 40px column gap and 32px between stacked sections. Below lg everything stacks, the visitor's notice first.

The board is a grid of mini notices, 2 columns on mobile and 3 from sm, with a 12px gap. The week scrubber is a single horizontally scrolling row of up to eight equal chips (min 4rem each), oldest left. Inside a notice: 28px top padding (room for the pin), 20px sides and bottom; content rows separated by dashed rules with 12px vertical padding; seals spaced 5px apart and wrapping.

The pennant header carries the app name and language switch in a top row, then the page title block, then bottom padding equal to its notch depth plus 12px so the notch never cuts text.

## Elevation & Depth

Depth is physical and soft: paper casts a long, low, diffuse shadow onto stone; brass pins and wax seals cast tiny tight shadows. Surfaces are otherwise flat and tonal (paper vs raised paper). There is no glow and no glass.

### Shadow Vocabulary
- **Notice lift** (`box-shadow: 0 2px 0 oklch(0 0 0 / 0.25), 0 18px 32px -18px oklch(0 0 0 / 0.8)`): the large notice; a thin paper-thickness edge plus a long soft fall-off.
- **Mini notice lift** (`box-shadow: 0 10px 18px -12px oklch(0 0 0 / 0.9)`): small notices on the board.
- **Pin** (`box-shadow: 0 2px 3px oklch(0 0 0 / 0.5)`, radial brass gradient lit from upper left): brass pin heads.
- **Seal** (`filter: drop-shadow(0 1px 1px oklch(0 0 0 / 0.55))`): pressed wax seals only; hollow rings cast nothing.
- **Menu** (`box-shadow: 0 8px 24px -6px rgb(0 0 0 / 0.25)`): the officer account dropdown.

### Named Rules
**The Pinned Paper Rule.** Board notices sit slightly off-true (-0.5deg, 0.35deg, -0.15deg cycling by position) and lift 2px on hover; reduced-motion users get them square. Rotation belongs to notices on the board, not to controls or the large notice.

## Shapes

Small, near-square corners throughout: 2px on content keys, 3px on mini notices, 4px on verdict strips, chips, and history rows, 5px on the large notice, 6px on officer controls, 8px on the officer menu. The only full rounds are brass pins, name-picker pills, and the officer avatar initial. The one large silhouette is the pennant: a full-width banner whose bottom edge notches up to a centre point (notch clamp(18px, 4.5vw, 64px)). Wax seals have an irregular poured rim, each rotated to its own angle so a row never looks machine-stamped. The limit is a 2px by 32px bone-ink bar between seals.

## Components

### Buttons
Officer controls are plain and compact.
- **Shape:** gently squared (6px).
- **Primary:** brass fill, brass-ink text, 14px medium, 8px by 16px; hover brightens 10%, active dims 5%.
- **Secondary:** paper fill, hall-rule border, 8px by 12px; hover goes to raised paper.
- **Quiet:** no fill, faded ink, 4px by 8px; hover raised paper and bone ink.
- **Focus:** global 2px brass outline, 2px offset. Disabled at 50% opacity.
- **Language switch:** a quiet button; on the pennant it uses banner ink at 80% with a 10% banner-ink hover wash.

### Chips
- **Week chip:** 4px corners, paper fill, faded ink, 12px label; active is banner green with banner ink and semibold.
- **Name pill (first-visit picker):** full round, 44px minimum height, raised paper with hall-rule border; hover turns border and text brass.

### Cards / Containers
- **Notice:** 5px corners, notice paper, notice lift shadow, brass pin 14px centred on the top edge, padding 28/20/20. Over the limit it gains a 2px seal-red ring.
- **Mini notice:** 3px corners, 8px pin, Trirong name, a seal row sized to the limit (12px seals) and a missed/limit count; seal-red ring when over, 1px brass ring when it is the visitor.
- **History row:** 4px corners, three-column grid (date range, seals and verdict, count); active row gets raised paper and a 2px brass outline.

### Inputs / Fields
- **Style:** 6px corners, paper fill, hall-rule border, 8px by 12px; hover border goes to faded ink.
- **Focus:** border turns brass (accent); caret and native accent colour are brass. Number spinners are removed.

### Navigation
- **Public:** the pennant header; app name in Trirong at 85% banner ink, language switch at right.
- **Officer:** a paper header bar with a bottom rule; tabs are 14px medium faded ink, active tab bone ink with a 2px brass underline. On mobile the tabs wrap to their own full-width row under a top rule.

### Wax Seal Row (signature)
One mark per run held. Missed runs fill from the left as poured-wax seals (seal red body, deep inner ring, lip highlight, stamped Trirong J at 16px and up); attended runs are hollow seal-empty rings. Default 20px, 26px in the limit row, 12px on mini notices and history. The whole row is one image with a spoken label ("missed n of b").

### Verdict Strip
The line under a notice name: "missed x of limit" in semibold at left, the verdict at right. Raised paper with clear-green text for a clean week, raised paper with faded verdict text mid-week, seal wash with seal-red text at or over the limit.

## Do's and Don'ts

### Do:
- **Do** show every miss count as seals next to the number; the number never stands alone.
- **Do** read content colours from the shared content map and render them as a 10px, 2px-corner square key.
- **Do** put a brass pin at the top centre of every notice-shaped container and give it 28px top padding.
- **Do** use Trirong bold for names and headings and Anuphan with tabular figures for everything numeric.
- **Do** mark the limit with the 2px bone-ink rule inside the seal row, with over-limit seals continuing after it.
- **Do** keep officer screens on the same tokens with plain controls (6px corners, brass primary).

### Don't:
- **Don't** use seal red for anything that is not a miss, warning, or over-limit state.
- **Don't** open a public page with stat tiles or a ranked leaderboard table.
- **Don't** give a content type a second colour, gradient, or tint on another screen.
- **Don't** add uppercase or letter-spaced labels above headings.
- **Don't** rotate controls, chips, or the visitor's large notice; off-true rotation is for board notices only, and never under reduced motion.
- **Don't** set numbers or controls in Trirong.
