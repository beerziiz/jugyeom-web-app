"use client";

import { useEffect, useState, useTransition, type ClipboardEvent, type KeyboardEvent } from "react";
import { TriangleAlert } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { saveWeek } from "./actions";
import { primaryButton } from "@/lib/ui";
import { COUNTED_BY_DAY, EVERY_DAY, contentColor, isHeldOn } from "@/lib/content";
import { today as bangkokToday, weekDays } from "@/lib/week";
import { ScreenshotReader, type GridRuns, type GridUpdate } from "./screenshot-reader";

export type GridMember = { id: number; ign: string };
export type GridContent = {
  id: number;
  key: string;
  name: string;
  hasScore: boolean;
  scoreLabel: string | null;
  /** Damage fields per member (one per boss); 0 when the content has no score. */
  scoreParts: number;
  runs: number;
  /** Days this week with a screenshot on record (YYYY-MM-DD). */
  days: string[];
};
export type GridEntry = {
  memberId: number;
  contentTypeId: number;
  missed: number;
  score: number | null;
  scoreParts: (number | null)[] | null;
};

/** Damage for one member on one day (Castle Rush). */
export type GridDayValue = { memberId: number; contentTypeId: number; day: string; value: number };

type Cell = { missed: string; scores: string[] };
/** Per member and content: damage typed for each day, keyed by YYYY-MM-DD. */
type DayValues = Record<string, Record<string, string>>;
/** "missed", or the index of a damage field. */
type Field = "missed" | number;

const key = (memberId: number, contentId: number) => `${memberId}:${contentId}`;
const toNumber = (value: string) => {
  const cleaned = value.replace(/[,\s]/g, "");
  return cleaned === "" ? null : Number(cleaned);
};

function initialCells(members: GridMember[], contents: GridContent[], entries: GridEntry[]) {
  const byKey = new Map(entries.map((e) => [key(e.memberId, e.contentTypeId), e]));
  const cells: Record<string, Cell> = {};
  for (const m of members) {
    for (const c of contents) {
      const e = byKey.get(key(m.id, c.id));
      const values = c.scoreParts > 1 ? (e?.scoreParts ?? []) : [e?.score ?? null];
      cells[key(m.id, c.id)] = {
        missed: e ? String(e.missed) : "0",
        scores: Array.from({ length: c.scoreParts }, (_, i) => (values[i] != null ? String(values[i]) : "")),
      };
    }
  }
  return cells;
}

function initialDayValues(dayValues: GridDayValue[]) {
  const out: DayValues = {};
  for (const d of dayValues) {
    const k = key(d.memberId, d.contentTypeId);
    out[k] = { ...out[k], [d.day]: String(d.value) };
  }
  return out;
}

/** The week's damage from its days, or null when no day has any. */
function sumDays(values: Record<string, string> | undefined) {
  const filled = Object.values(values ?? {}).map(toNumber).filter((v): v is number => v !== null);
  return filled.length ? filled.reduce((a, b) => a + b, 0) : null;
}

export function WeekGrid({
  weekStart,
  recorded,
  members,
  contents,
  entries,
  dayValues,
  threshold,
  t,
  tr,
}: {
  weekStart: string;
  recorded: boolean;
  members: GridMember[];
  contents: GridContent[];
  entries: GridEntry[];
  dayValues: GridDayValue[];
  threshold: number;
  t: Dictionary["week"];
  tr: Dictionary["reader"];
}) {
  const [saved, setSaved] = useState(() => ({
    cells: initialCells(members, contents, entries),
    runs: Object.fromEntries(contents.map((c) => [c.id, String(c.runs)])) as Record<number, string>,
    dayVals: initialDayValues(dayValues),
  }));
  const [cells, setCells] = useState(saved.cells);
  const [runs, setRuns] = useState(saved.runs);
  const [dayVals, setDayVals] = useState(saved.dayVals);
  /** The day whose damage the column shows, per content; none shows the week's total. */
  const [picked, setPicked] = useState<Record<number, string | null>>(() => {
    // Start on today when it falls in this week, ready to type.
    const today = bangkokToday();
    const day = weekDays(weekStart).includes(today) ? today : null;
    return Object.fromEntries(contents.filter((c) => EVERY_DAY.includes(c.key)).map((c) => [c.id, day]));
  });
  const [days, setDays] = useState(() => Object.fromEntries(contents.map((c) => [c.id, c.days])) as Record<number, string[]>);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startSave] = useTransition();

  // Daily content counts the days read from screenshots; a week with none yet keeps the typed number.
  const countsDays = (c: GridContent) => COUNTED_BY_DAY.includes(c.key) && days[c.id].length > 0;
  const runsOf = (contentId: number) => {
    const c = contents.find((x) => x.id === contentId);
    return c && countsDays(c) ? days[c.id].length : (toNumber(runs[contentId] ?? "") ?? 0);
  };
  const heldRuns = Object.fromEntries(contents.map((c) => [c.id, String(runsOf(c.id))])) as Record<number, string>;

  const dirty = JSON.stringify({ cells, runs: heldRuns, dayVals }) !== JSON.stringify(saved);

  // Castle Rush damage is entered per day; the week's damage is their sum.
  const byDay = (c: GridContent, field: Field) => EVERY_DAY.includes(c.key) && c.scoreParts === 1 && field === 0;
  // The week's total is always the sum of the days, never typed.
  const lockedTotal = (c: GridContent, field: Field) => byDay(c, field) && !picked[c.id];
  const daysWithValues = (c: GridContent) =>
    weekDays(weekStart).filter((d) => members.some((m) => toNumber(dayVals[key(m.id, c.id)]?.[d] ?? "") !== null));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Column order for keyboard movement: each content has "missed" then its damage fields.
  const columns = contents.flatMap((c) => [
    { c, field: "missed" as Field },
    ...Array.from({ length: c.scoreParts }, (_, i) => ({ c, field: i as Field })),
  ]);

  const withValue = (cell: Cell, field: Field, value: string): Cell =>
    field === "missed"
      ? { ...cell, missed: value }
      : { ...cell, scores: cell.scores.map((v, i) => (i === field ? value : v)) };
  const valueOf = (memberId: number, c: GridContent, field: Field) => {
    const day = byDay(c, field) ? picked[c.id] : null;
    if (day) return dayVals[key(memberId, c.id)]?.[day] ?? "";
    const cell = cells[key(memberId, c.id)];
    return field === "missed" ? cell.missed : cell.scores[field];
  };
  const fieldLabel = (c: GridContent, field: Field) => {
    if (field === "missed") return t.missed;
    if (c.scoreParts > 1) return t.part.replace("{n}", String(field + 1));
    const label = c.scoreLabel ?? t.score;
    if (!byDay(c, field)) return label;
    const day = picked[c.id];
    return day
      ? `${label} · ${t.weekdays[weekDays(weekStart).indexOf(day)]} ${Number(day.slice(8))}`
      : `${label} · ${t.weekTotal}`;
  };

  /** Writes typed values; a picked day's damage goes to that day and the week's total follows. */
  function write(changes: { memberId: number; c: GridContent; field: Field; value: string }[]) {
    setStatus("idle");
    const nextDays = { ...dayVals };
    const totals = new Map<string, string>();
    for (const { memberId, c, field, value } of changes) {
      const day = byDay(c, field) ? picked[c.id] : null;
      if (!day) continue;
      const k = key(memberId, c.id);
      nextDays[k] = { ...nextDays[k], [day]: value };
      totals.set(k, String(sumDays(nextDays[k]) ?? ""));
    }
    if (totals.size) setDayVals(nextDays);
    setCells((prev) => {
      const next = { ...prev };
      for (const { memberId, c, field, value } of changes) {
        const k = key(memberId, c.id);
        next[k] = withValue(next[k], field, totals.get(k) ?? value);
      }
      return next;
    });
  }

  // Results read from screenshots land in the cells; the officer still reviews and saves.
  function applyUpdates(updates: GridUpdate[], held: GridRuns) {
    const byKey = new Map(contents.map((c) => [c.key, c]));
    setStatus("idle");
    setDays((prev) => {
      const next = { ...prev };
      for (const { contentKey, day } of held.days) {
        const c = byKey.get(contentKey);
        if (c && !next[c.id].includes(day)) next[c.id] = [...next[c.id], day].sort();
      }
      return next;
    });
    setRuns((prev) => {
      const next = { ...prev };
      for (const r of held.runs) {
        const c = byKey.get(r.contentKey);
        if (c) next[c.id] = String(r.runs);
      }
      return next;
    });
    const nextDays = { ...dayVals };
    for (const v of held.values) {
      const c = byKey.get(v.contentKey);
      if (c) nextDays[key(v.memberId, c.id)] = { ...nextDays[key(v.memberId, c.id)], [v.day]: String(v.value) };
    }
    if (held.values.length) setDayVals(nextDays);
    setCells((prev) => {
      const next = { ...prev };
      for (const u of updates) {
        const c = byKey.get(u.contentKey);
        const k = c && key(u.memberId, c.id);
        if (!c || !k || !next[k]) continue;
        let cell = next[k];
        if (u.missed !== undefined) cell = { ...cell, missed: String(u.missed) };
        if (u.score && u.score.part < cell.scores.length) cell = withValue(cell, u.score.part, String(u.score.value));
        next[k] = cell;
      }
      // Damage kept per day adds up to the week, including days typed but not saved yet.
      for (const c of contents.filter((x) => byDay(x, 0))) {
        for (const m of members) {
          const total = sumDays(nextDays[key(m.id, c.id)]);
          if (total !== null) next[key(m.id, c.id)] = withValue(next[key(m.id, c.id)], 0, String(total));
        }
      }
      return next;
    });
  }

  // Paste a column of values from a spreadsheet: fill down from this row.
  function handlePaste(e: ClipboardEvent<HTMLInputElement>, rowIndex: number, c: GridContent, field: Field) {
    const lines = e.clipboardData.getData("text").split(/\r?\n/).map((l) => l.split("\t")[0].trim());
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    if (lines.length < 2) return;
    e.preventDefault();
    write(
      lines.flatMap((value, i) => {
        const member = members[rowIndex + i];
        return member && !lockedTotal(c, field)
          ? [{ memberId: member.id, c, field, value: value.replace(/,/g, "") }]
          : [];
      }),
    );
  }

  // Enter moves down the column, Shift+Enter moves up.
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const target = document.querySelector<HTMLInputElement>(
      `[data-cell="${rowIndex + (e.shiftKey ? -1 : 1)}-${colIndex}"]`,
    );
    target?.focus();
    target?.select();
  }

  function rowTotal(memberId: number) {
    return contents.reduce((sum, c) => sum + (toNumber(cells[key(memberId, c.id)].missed) ?? 0), 0);
  }

  function handleSave() {
    const payload = members.flatMap((m) =>
      contents.map((c) => {
        const cell = cells[key(m.id, c.id)];
        const parts = cell.scores.map(toNumber);
        const filled = parts.filter((v): v is number => v !== null);
        return {
          memberId: m.id,
          contentTypeId: c.id,
          missed: toNumber(cell.missed) ?? 0,
          score: filled.length ? filled.reduce((a, b) => a + b, 0) : null,
          scoreParts: c.scoreParts > 1 ? parts : null,
        };
      }),
    );
    startSave(async () => {
      const runsPayload = contents.map((c) => ({ contentTypeId: c.id, runs: runsOf(c.id) }));
      // Only days whose damage changed since the last save.
      const dayPayload = Object.entries(dayVals).flatMap(([k, byDate]) => {
        const [memberId, contentTypeId] = k.split(":").map(Number);
        return Object.entries(byDate)
          .filter(([day, v]) => v !== (saved.dayVals[k]?.[day] ?? ""))
          .map(([day, v]) => ({ memberId, contentTypeId, day, value: toNumber(v) }));
      });
      const result = await saveWeek(weekStart, payload, runsPayload, dayPayload);
      if (result.ok) {
        setSaved({ cells, runs: heldRuns, dayVals });
        setStatus("saved");
      } else {
        setStatus("error");
      }
    });
  }

  const flagged = members.filter((m) => rowTotal(m.id) >= threshold).length;
  const cellInput =
    "w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-right tabular-nums transition-colors hover:border-border focus:border-accent focus:bg-surface focus:outline-none";

  return (
    <div className="flex flex-col gap-3">
      <ScreenshotReader
        weekStart={weekStart}
        members={members}
        contentKeys={contents.map((c) => c.key)}
        onApply={applyUpdates}
        t={tr}
      />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm text-muted">
        <p>{recorded ? t.pasteHint : t.notRecorded}</p>
        <p className="flex items-center gap-1.5">
          <TriangleAlert className="size-4 text-warn" aria-hidden />
          {t.threshold.replace("{n}", String(threshold))}
          {flagged > 0 && <strong className="text-warn tabular-nums">· {flagged}</strong>}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th rowSpan={3} className="sticky left-0 z-10 bg-surface-2 px-3 py-2 text-left font-medium">
                {t.member}
              </th>
              {contents.map((c) => (
                <th
                  key={c.id}
                  colSpan={1 + c.scoreParts}
                  className="border-l border-border px-3 pt-2 text-center font-medium"
                  style={{ boxShadow: `inset 0 3px 0 ${contentColor(c.key)}` }}
                >
                  {c.name}
                </th>
              ))}
              <th rowSpan={3} className="border-l border-border px-3 py-2 text-right font-medium">
                {t.total}
              </th>
            </tr>
            <tr className="border-b border-border bg-surface-2 text-xs text-muted">
              {columns.map(({ c, field }) => (
                <th
                  key={`${c.id}-${field}`}
                  className={`px-2 pb-2 text-right font-normal ${field === "missed" ? "border-l border-border" : ""}`}
                >
                  {fieldLabel(c, field)}
                </th>
              ))}
            </tr>
            <tr className="border-b border-border bg-surface-2 text-xs text-muted">
              {contents.map((c) => (
                <th key={`${c.id}-r`} colSpan={1 + c.scoreParts} className="border-l border-border px-2 pb-2 font-normal">
                  {countsDays(c) || EVERY_DAY.includes(c.key) ? (
                    <DayStrip
                      weekStart={weekStart}
                      content={c}
                      counted={countsDays(c) ? days[c.id] : daysWithValues(c)}
                      summary={countsDays(c) ? t.runsFromDays.replace("{n}", String(runsOf(c.id))) : null}
                      picked={picked[c.id] ?? null}
                      onPick={
                        byDay(c, 0)
                          ? (day) => setPicked((prev) => ({ ...prev, [c.id]: prev[c.id] === day ? null : day }))
                          : undefined
                      }
                      t={t}
                    />
                  ) : (
                    <label className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <span>{t.runsHeld}</span>
                      <input
                        inputMode="numeric"
                        value={runs[c.id] ?? ""}
                        onChange={(e) => {
                          setStatus("idle");
                          setRuns((prev) => ({ ...prev, [c.id]: e.target.value }));
                        }}
                        onFocus={(e) => e.target.select()}
                        aria-label={`${c.name} ${t.runsHeld}`}
                        className="w-12 rounded border border-border bg-surface px-2 py-1 text-right text-foreground tabular-nums focus:border-accent focus:outline-none"
                      />
                    </label>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, rowIndex) => {
              const total = rowTotal(m.id);
              const over = total >= threshold;
              return (
                <tr
                  key={m.id}
                  className={`border-b border-border last:border-b-0 ${over ? "bg-[color-mix(in_oklch,var(--miss)_14%,var(--surface))]" : ""}`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 max-w-44 truncate px-3 py-1 text-left font-medium ${
                      over ? "bg-[color-mix(in_oklch,var(--miss)_14%,var(--surface))]" : "bg-surface"
                    }`}
                  >
                    {m.ign}
                  </th>
                  {columns.map(({ c, field }, colIndex) => (
                    <td
                      key={`${c.id}-${field}`}
                      className={`px-1 py-1 ${field === "missed" ? "w-16 border-l border-border" : c.scoreParts > 1 ? "w-24" : "w-32"}`}
                    >
                      <input
                        data-cell={`${rowIndex}-${colIndex}`}
                        inputMode={field === "missed" ? "numeric" : "decimal"}
                        aria-label={`${m.ign} ${c.name} ${fieldLabel(c, field)}`}
                        title={
                          field === "missed" && (toNumber(cells[key(m.id, c.id)].missed) ?? 0) > runsOf(c.id)
                            ? t.overRuns
                            : lockedTotal(c, field)
                              ? t.pickDayToEdit
                              : undefined
                        }
                        value={valueOf(m.id, c, field)}
                        readOnly={lockedTotal(c, field)}
                        onChange={(e) => write([{ memberId: m.id, c, field, value: e.target.value }])}
                        onFocus={(e) => e.target.select()}
                        onPaste={(e) => handlePaste(e, rowIndex, c, field)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        className={`${cellInput} ${
                          field === "missed" && (toNumber(cells[key(m.id, c.id)].missed) ?? 0) > runsOf(c.id)
                            ? "font-semibold text-danger underline decoration-wavy"
                            : field === "missed" && (toNumber(cells[key(m.id, c.id)].missed) ?? 0) > 0
                              ? "font-semibold text-warn"
                              : lockedTotal(c, field)
                                ? "cursor-default text-muted hover:border-transparent"
                                : ""
                        }`}
                      />
                    </td>
                  ))}
                  <td
                    className={`border-l border-border px-3 py-1 text-right tabular-nums ${
                      over ? "font-semibold text-warn" : "text-muted"
                    }`}
                  >
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <p role="status" aria-live="polite" className="text-sm">
          {status === "saved" && !dirty && <span className="text-ok">{t.saved}</span>}
          {status === "error" && <span className="text-danger">{t.error}</span>}
          {status === "idle" && dirty && <span className="text-muted">{t.unsaved}</span>}
        </p>
        <button
          onClick={handleSave}
          disabled={pending || (!dirty && recorded)}
          className={primaryButton}
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}

/**
 * The week's seven days for one content: which have results, and which still need a screenshot.
 * With `onPick`, each day is a button that shows that day's damage in the column.
 */
function DayStrip({
  weekStart,
  content,
  counted,
  summary,
  picked,
  onPick,
  t,
}: {
  weekStart: string;
  content: GridContent;
  counted: string[];
  summary: string | null;
  picked: string | null;
  onPick?: (day: string) => void;
  t: Dictionary["week"];
}) {
  const today = bangkokToday();
  const color = contentColor(content.key);
  return (
    <div className="flex flex-col items-end gap-1">
      <ol className="flex gap-0.5" aria-label={summary ? `${content.name} ${t.runsHeld}: ${summary}` : content.name}>
        {weekDays(weekStart).map((day, i) => {
          const state = counted.includes(day)
            ? "counted"
            : !isHeldOn(content.key, day)
              ? "off"
              : day <= today
                ? "missing"
                : "ahead";
          const title = [
            {
              counted: COUNTED_BY_DAY.includes(content.key) ? t.dayRead : t.dayCounted,
              missing: t.dayMissing,
              off: t.dayOff,
              ahead: t.dayAhead,
            }[state].replace("{day}", day),
            day === today ? t.today : null,
            onPick ? (picked === day ? t.showWeekTotal : t.pickDay) : null,
          ]
            .filter(Boolean)
            .join(" · ");
          const look = `grid h-5 min-w-5 place-items-center rounded-sm border px-0.5 text-[0.625rem] leading-none ${
            state === "counted"
              ? "border-transparent font-semibold text-background"
              : state === "missing"
                ? "border-dashed border-warn text-warn"
                : state === "off"
                  ? "border-transparent text-muted/40"
                  : "border-border text-muted"
          } ${picked === day ? "outline-2 outline-offset-1 outline-accent" : ""}`;
          const style = state === "counted" ? { backgroundColor: color } : undefined;
          return (
            <li key={day} className="flex flex-col items-center gap-0.5">
              {onPick ? (
                <button
                  type="button"
                  title={title}
                  aria-label={title}
                  aria-pressed={picked === day}
                  onClick={() => onPick(day)}
                  className={`${look} cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-accent`}
                  style={style}
                >
                  {t.weekdays[i]}
                </button>
              ) : (
                <span title={title} aria-label={title} className={look} style={style}>
                  {t.weekdays[i]}
                </span>
              )}
              {/* Today: a small mark under the day. */}
              <span
                aria-hidden
                className={`size-1 rounded-full ${day === today ? "bg-foreground" : "bg-transparent"}`}
              />
            </li>
          );
        })}
      </ol>
      {summary && <span className="whitespace-nowrap">{summary}</span>}
    </div>
  );
}
