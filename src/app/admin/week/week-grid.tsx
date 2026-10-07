"use client";

import { useEffect, useMemo, useState, useTransition, type ClipboardEvent, type KeyboardEvent } from "react";
import { TriangleAlert } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { saveWeek } from "./actions";
import { primaryButton } from "@/lib/ui";
import { contentColor } from "@/lib/content";
import { ScreenshotReader, type GridUpdate } from "./screenshot-reader";

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
};
export type GridEntry = {
  memberId: number;
  contentTypeId: number;
  missed: number;
  score: number | null;
  scoreParts: (number | null)[] | null;
};

type Cell = { missed: string; scores: string[] };
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

export function WeekGrid({
  weekStart,
  recorded,
  members,
  contents,
  entries,
  threshold,
  t,
  tr,
}: {
  weekStart: string;
  recorded: boolean;
  members: GridMember[];
  contents: GridContent[];
  entries: GridEntry[];
  threshold: number;
  t: Dictionary["week"];
  tr: Dictionary["reader"];
}) {
  const [saved, setSaved] = useState(() => ({
    cells: initialCells(members, contents, entries),
    runs: Object.fromEntries(contents.map((c) => [c.id, String(c.runs)])) as Record<number, string>,
  }));
  const [cells, setCells] = useState(saved.cells);
  const [runs, setRuns] = useState(saved.runs);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startSave] = useTransition();

  const dirty = useMemo(
    () => JSON.stringify({ cells, runs }) !== JSON.stringify(saved),
    [cells, runs, saved],
  );
  const runsOf = (contentId: number) => toNumber(runs[contentId] ?? "") ?? 0;

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
  const valueOf = (cell: Cell, field: Field) => (field === "missed" ? cell.missed : cell.scores[field]);
  const fieldLabel = (c: GridContent, field: Field) =>
    field === "missed"
      ? t.missed
      : c.scoreParts > 1
        ? t.part.replace("{n}", String(field + 1))
        : (c.scoreLabel ?? t.score);

  function update(memberId: number, contentId: number, field: Field, value: string) {
    setStatus("idle");
    setCells((prev) => ({ ...prev, [key(memberId, contentId)]: withValue(prev[key(memberId, contentId)], field, value) }));
  }

  // Results read from screenshots land in the cells; the officer still reviews and saves.
  function applyUpdates(updates: GridUpdate[]) {
    const byKey = new Map(contents.map((c) => [c.key, c]));
    setStatus("idle");
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
      return next;
    });
  }

  // Paste a column of values from a spreadsheet: fill down from this row.
  function handlePaste(e: ClipboardEvent<HTMLInputElement>, rowIndex: number, contentId: number, field: Field) {
    const lines = e.clipboardData.getData("text").split(/\r?\n/).map((l) => l.split("\t")[0].trim());
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    if (lines.length < 2) return;
    e.preventDefault();
    setStatus("idle");
    setCells((prev) => {
      const next = { ...prev };
      lines.forEach((value, i) => {
        const member = members[rowIndex + i];
        if (!member) return;
        const k = key(member.id, contentId);
        next[k] = withValue(next[k], field, value.replace(/,/g, ""));
      });
      return next;
    });
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
      const result = await saveWeek(weekStart, payload, runsPayload);
      if (result.ok) {
        setSaved({ cells, runs });
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
        runsOf={(contentKey) => {
          const c = contents.find((x) => x.key === contentKey);
          return c ? runsOf(c.id) : 0;
        }}
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
                  <label className="flex items-center justify-end gap-2">
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
                  className={`border-b border-border last:border-b-0 ${over ? "bg-[color-mix(in_oklch,var(--seal)_14%,var(--surface))]" : ""}`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 max-w-44 truncate px-3 py-1 text-left font-medium ${
                      over ? "bg-[color-mix(in_oklch,var(--seal)_14%,var(--surface))]" : "bg-surface"
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
                        title={field === "missed" && (toNumber(cells[key(m.id, c.id)].missed) ?? 0) > runsOf(c.id) ? t.overRuns : undefined}
                        value={valueOf(cells[key(m.id, c.id)], field)}
                        onChange={(e) => update(m.id, c.id, field, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onPaste={(e) => handlePaste(e, rowIndex, c.id, field)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        className={`${cellInput} ${
                          field === "missed" && (toNumber(cells[key(m.id, c.id)].missed) ?? 0) > runsOf(c.id)
                            ? "font-semibold text-danger underline decoration-wavy"
                            : field === "missed" && (toNumber(cells[key(m.id, c.id)].missed) ?? 0) > 0
                              ? "font-semibold text-warn"
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
