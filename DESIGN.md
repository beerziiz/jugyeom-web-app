---
name: Jugyeom
description: Guild board for a Seven Knights Re:BIRTH guild, drawn as an esports match broadcast; each week reads like a series score of slanted plates.
colors:
  ground: "oklch(0.155 0.022 285)"
  ink: "oklch(0.96 0.008 285)"
  panel: "oklch(0.205 0.03 285)"
  panel-raised: "oklch(0.25 0.036 285)"
  rule: "oklch(0.32 0.04 285)"
  muted: "oklch(0.74 0.03 285)"
  idle: "oklch(0.36 0.03 285)"
  live: "oklch(0.82 0.16 75)"
  live-ink: "oklch(0.2 0.04 70)"
  miss: "oklch(0.65 0.22 22)"
  miss-ground: "oklch(0.65 0.22 22 / 0.16)"
  ok: "oklch(0.82 0.11 220)"
  guild-war: "oklch(0.68 0.15 250)"
  castle: "oklch(0.76 0.06 55)"
  advent: "oklch(0.68 0.17 300)"
  checkin: "oklch(0.76 0.13 350)"
typography:
  display:
    fontFamily: "Kanit, sans-serif"
    fontSize: "clamp(2rem, 6vw, 3.2rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  score:
    fontFamily: "Kanit, sans-serif"
    fontSize: "3.2rem"
    fontWeight: 800
    lineHeight: 1
  headline:
    fontFamily: "Kanit, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  card-name:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 800
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "tnum"
  caption:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
    fontFeature: "tnum"
rounded:
  plate: "1px"
  card: "4px"
  control: "6px"
  panel: "8px"
  full: "9999px"
spacing:
  mark-gap: "3px"
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "20px"
  xl: "32px"
  column: "40px"
components:
  score-bug:
    backgroundColor: "{colors.live}"
    textColor: "{colors.live-ink}"
    typography: "{typography.card-name}"
    padding: "4px 17.6px 4px 14px"
  score-bug-tag:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "4px 17.6px 4px 16px"
  player-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  board-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  board-card-hover:
    backgroundColor: "{colors.panel-raised}"
  board-card-warned:
    backgroundColor: "{colors.miss-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  week-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    height: "44px"
    padding: "0 8px"
  week-chip-active:
    backgroundColor: "{colors.live}"
    textColor: "{colors.live-ink}"
  name-chip:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0 20px"
  name-chip-hover:
    backgroundColor: "{colors.live}"
    textColor: "{colors.live-ink}"
  button-primary:
    backgroundColor: "{colors.live}"
    textColor: "{colors.live-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.panel-raised}"
  button-quiet:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 8px"
  field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  officer-panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
    padding: "16px"
---

# Design System: Jugyeom

## Overview

**Creative North Star: "Match Broadcast"**

The guild board is an esports match broadcast graphic. A gold score bug sits in the top-left corner with the week beside it, every member is a player card, and a week reads like a series score: one slanted plate per run, filled when attended, left as an empty red outline when missed. The ground is a near-black indigo, panels step up in indigo, and colour arrives only where it carries meaning: gold for what is live or pressable, red for misses, cyan for a clean week, and one flat colour per content type.

Density is a broadcast overlay's: big scale contrast between the heavy italic names and score numerals (Kanit 800 italic) and the quiet, tabular UI text (Anuphan). Shapes are slanted, never round: plates lean at -18deg and the score bug and chips are parallelograms cut by clip-path. Depth is tonal; nothing floats on shadows. Dark is the default theme. The previous "Night Hall Notice Board" world (green pennant, brass pins, wax seals, Trirong) is retired, and green is rejected outright.

Officer pages (`/admin`) share the tokens, the score bug and the content colours but keep a plain working layout: bordered 8px panels, tables, and 6px controls.

**Key Characteristics:**
- Near-black indigo ground, indigo panels, flat tonal layering.
- Slanted plates (skewX -18deg) as the only mark shape.
- Live gold, miss red and clean cyan each have one job; content colours never borrow them.
- Kanit heavy italic for names, headings and scores; Anuphan with tabular numerals for everything else.
- Misses never disappear: a missed run stays on screen as a red outline gap.

## Colors

A dark indigo broadcast palette with three signal colours and four content colours, all in OKLCH.

### Primary
- **Live Gold** (`live`): the score bug plate, the "you" ring, the active week chip, primary buttons, focus outlines, caret and selection tint. If it is gold, it is live, it is you, or you can press it.
- **Live Ink** (`live-ink`): text set on Live Gold.

### Secondary
- **Miss Red** (`miss`): missed-run outlines, used allowance plates, over-limit plates, the missed numeral on a warned card, error text. Aliased as `--warn` and `--danger` in code; they are the same red.
- **Miss Ground** (`miss-ground`): the 16% red wash behind a warned board card, a warned history row and the warned verdict strip.

### Tertiary
- **Clean Cyan** (`ok`): text only, for clean states: "no misses", "nobody warned this week", "saved".

### Content Colours
- **Guild War Blue** (`guild-war`), **Castle Sand** (`castle`), **Advent Violet** (`advent`, shared by both Advent contents), **Check-in Rose** (`checkin`): the fill of attended run plates and the small slanted swatch before each content name. Unknown content falls back to `muted`.

### Neutral
- **Broadcast Night** (`ground`): page ground.
- **Indigo Panel** (`panel`): cards, inputs, inactive chips.
- **Raised Panel** (`panel-raised`): the score bug's tag plate, the verdict strip, hover state for cards and chips, name chips.
- **Indigo Rule** (`rule`): hairline borders, list dividers, scrollbar thumb.
- **Muted Lavender** (`muted`): secondary text, counts, inactive chips.
- **Idle Plate** (`idle`): the default mark fill before a state class applies.
- **Broadcast White** (`ink`): text, allowance plates still in hand, the limit bar.

A provisional light set ("Day broadcast") exists under `:root[data-theme="light"]` with darker versions of every signal and content colour. Nothing switches to it yet; treat it as a draft, not a supported theme.

### Named Rules
**The One Job Rule.** Live Gold is reserved for the score bug, "you", the active state and pressable things. Miss Red is reserved for misses and warnings. Clean Cyan is for clean states only. No other element may use them.

**The No Look-alikes Rule.** A content colour must never be mistakable for gold, cyan or red. Guild War Blue (hue 250) sits nearest to Clean Cyan (hue 220); keep it darker and more saturated, and keep cyan to text.

**The No Green Rule.** Green does not appear anywhere: not for success, not for content, not as an accent.

## Typography

**Display Font:** Kanit 600/700/800, normal and italic (sans-serif fallback)
**Body Font:** Anuphan 400/500/600/700 (system-ui fallback)

**Character:** Kanit's heavy italic is the score graphic, loud and fast-leaning. Anuphan is the quiet commentary, and every number in it is tabular so scores and counts line up.

### Hierarchy
- **Display** (Kanit 800 italic, `clamp(2rem, 6vw, 3.2rem)`, 1.05): the page title under the score bug ("กระดานกิลด์").
- **Score** (Kanit 800 italic, 3.2rem, 1): the big missed numeral on the player card, followed by `/limit` in Kanit 600 at 1.25rem in muted. Turns Miss Red at or past the limit.
- **Headline** (Kanit 800 italic, 2rem, 1.1): the member name on the player card.
- **Title** (Kanit 800 italic, 1.35rem): section headings ("warned", "everyone", "history"), each followed by a count in Anuphan, upright.
- **Card name** (Kanit 800 italic, 1.1rem): names on board cards; the uppercase app name in the score bug at 1.05rem.
- **Body** (Anuphan 400, 1rem, tabular numerals): running text, verdict strips.
- **Label** (Anuphan 400 to 600, 0.875rem): roles, run counts, buttons, chips, the allowance note.
- **Caption** (Anuphan 400, 0.75rem): week chips, the mark legend.

### Named Rules
**The Two Voices Rule.** Names, headings and scores are Kanit heavy italic; everything else is Anuphan. Counts beside a heading drop back to upright Anuphan.

**The Tabular Rule.** Numbers are always tabular (`font-variant-numeric: tabular-nums` on body).

## Layout

Public pages sit in a 64rem (`max-w-5xl`) column with 16px side padding. Above 1024px the board splits into a 26rem left column (the visitor's player card or the name picker, then the week chips) that sticks 24px from the top, and a fluid right column with a 40px gap. Below 1024px they stack with 32px between groups. Board cards use a 2-column grid on mobile and 3 columns from 640px, with a 10px gap. Section headings sit 12px above their grids.

The header has two rows on public pages: the score bug with the language switch at right, then the banner (title or back link) with 20px above and 24px below, closed by a hairline rule. Officer pages use a single-row header on Indigo Panel with the nav beside the score bug; on mobile the nav wraps to its own full-width scrolling row. Officer content runs to 72rem (`max-w-6xl`).

Card interiors use 20px padding on the player card and 12px on board cards. Touch targets for chips and back links are at least 44px tall.

## Elevation & Depth

Flat by default. Depth comes from three indigo steps (ground, panel, raised panel) and from tinted grounds (Miss Ground for warnings). Rings mark state instead of shadows: a 1px inset gold ring for "you" or the active row, a 2px red ring around a warned player card.

### Shadow Vocabulary
- **Menu lift** (`box-shadow: 0 8px 24px -6px rgb(0 0 0 / 0.25)`): the officer account dropdown only.

### Named Rules
**The Tonal Depth Rule.** Cards never cast shadows. Lift a surface by moving it one indigo step up; mark state with a ring or a tinted ground.

## Shapes

The world leans. Run marks, allowance plates and the limit bar are skewed -18deg; the score bug's lead plate is cut square-left and slanted-right, its tag plate slanted on both ends (10px cut); chips are parallelograms with a 6px cut. Plates keep a 1px corner so they read as solid tiles, not pills. Cards use a tight 4px corner. Officer working surfaces use 6px controls and 8px panels. Round shapes appear only for the officer avatar and small status dots.

**The Lean Rule.** Every mark is a slanted plate at -18deg. No dots, circles, checkmarks or seals stand in for a run.

## Components

### Score Bug
The broadcast corner graphic and the app's home link. A Live Gold lead plate with the uppercase app name in Kanit italic, then a Raised Panel tag plate with the week, overlapping 6px. The Discord OG card draws the same bug at 1200x630 with skewed plates and hard-coded hex equivalents of the tokens.

### Run Marks (signature)
- **Shape:** 18x10px plates (12x7 small, 30x16 large), 1px corner, skewX -18deg, 3px apart.
- **Attended:** filled in the content colour.
- **Missed:** empty, with a Miss Red inset outline (2px; 1.5px small; 2.5px large). Plates fill left to right; runs carry no individual identity.

### Allowance Row (signature)
One plate per allowed miss (the threshold). Broadcast White plates are misses still in hand before a warning; used plates are Miss Red outlines. At or past the limit the week is a warning and every used plate turns solid Miss Red. Misses past the limit follow a 3px white limit bar as further solid red plates. A short note sits beside the large row ("2 left", "at the limit", "1 over"). The OG card draws at most one over plate after the bar, then a red "+n" count.

### Cards / Containers
- **Player card:** Indigo Panel, 4px corner, 20px padding. Header with the Headline name and the Score numeral, the allowance row, a full-width verdict strip (Raised Panel; Miss Ground with red text when warned; the clean verdict in cyan), one row per content with a slanted colour swatch and its run marks, then a legend. A warned player card gets a 2px Miss Red ring.
- **Board card:** Indigo Panel, 4px corner, 12px padding, name plus small allowance row and `missed/limit`. Warned cards sit on Miss Ground. The visitor's own card gets a 1px inset gold ring. Hover moves to Raised Panel in 150ms.
- **History row:** same treatment as board cards; the active week is Raised Panel with the inset gold ring.
- **Officer panel:** Indigo Panel, 8px corner, 1px Indigo Rule border, 16 to 20px padding; a kick-level warning swaps the border to Miss Red.

### Chips
- **Week chip:** slanted, at least 44px tall, Caption type. Inactive on Indigo Panel in muted text; the active week is Live Gold with Live Ink, semibold.
- **Name chip (picker):** slanted, at least 44px tall, Raised Panel; hover turns Live Gold, because it is pressable.

### Buttons
- **Shape:** gently squared (6px).
- **Primary:** Live Gold with Live Ink, 8px 16px, medium weight; hover brightens 10%, active dims 5%.
- **Secondary:** Indigo Panel with a 1px rule border; hover to Raised Panel.
- **Quiet:** muted text, no ground; hover to Raised Panel and ink.
- **Disabled:** 50% opacity, not-allowed cursor.

### Inputs / Fields
- **Style:** Indigo Panel, 1px Indigo Rule border, 6px corner, 8px 12px padding. Number inputs drop their spinners.
- **Focus:** border turns Live Gold; caret and native controls are gold. Keyboard focus anywhere shows a 2px gold outline offset 2px.
- **Error / Disabled:** error text in Miss Red; disabled fields at 60% opacity.

### Navigation
Officer nav: Anuphan medium at 0.875rem, muted text, a 2px Live Gold underline on the active item, ink on hover; scrolls horizontally on narrow screens. Public pages have no nav beyond the score bug, the back link and the language switch.

## Do's and Don'ts

### Do:
- **Do** draw every run as a slanted plate at -18deg: filled in the content colour when attended, an empty Miss Red outline when missed.
- **Do** give the allowance row one plate per allowed miss, white for misses left, red outline for used, all solid red once the limit is reached, with over-limit plates after a white limit bar.
- **Do** keep Live Gold for the score bug, "you", the active state and pressable things.
- **Do** mark a warned board card with the Miss Ground wash, and the visitor's own card with a 1px inset gold ring.
- **Do** set names, headings and scores in Kanit 800 italic, and all UI text and numbers in Anuphan with tabular numerals.
- **Do** build depth from the three indigo steps, not shadows.

### Don't:
- **Don't** use green anywhere.
- **Don't** put coloured side stripes on cards; state lives in the ground or a full ring.
- **Don't** use Live Gold, Miss Red or Clean Cyan for anything outside their single role, and don't pick a content colour that could be mistaken for any of them.
- **Don't** hide a miss: a missed run stays on screen as an outline gap.
- **Don't** bring back the Night Hall Notice Board devices: pennants, brass pins, wax seals, Trirong.
- **Don't** give cards drop shadows; the only shadow is the officer dropdown.
