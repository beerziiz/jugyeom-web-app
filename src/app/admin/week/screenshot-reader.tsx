"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { ImageUp, LoaderCircle, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ADVENT_GOD_ATTACKS, GUILD_WAR_ATTACKS, GUILD_WAR_DAYS } from "@/lib/content";
import { field, primaryButton, quietButton, secondaryButton } from "@/lib/ui";
import { weekEnd } from "@/lib/week";
import { readScreen, saveDayMarks, type DayMark, type ReadRow } from "./screenshot-actions";

/** A change the reader asks the grid to make. `part` is the damage field index. */
export type GridUpdate = { memberId: number; contentKey: string; missed?: number; score?: { part: number; value: number } };
/** Days now on record per content, and runs that follow from the screenshot's day. */
export type GridRuns = {
  days: { contentKey: string; day: string }[];
  runs: { contentKey: string; runs: number }[];
  /** Damage read for one day, per member. */
  values: { contentKey: string; day: string; memberId: number; value: number }[];
};

type Screen = "guild_members" | "guild_war" | "castle" | "advent1" | "advent2" | "advent3" | "advent4" | "god";
const SCREENS: Screen[] = ["guild_members", "guild_war", "castle", "advent1", "advent2", "advent3", "advent4", "god"];
const DAILY: Screen[] = ["guild_members", "guild_war", "castle"];
const kindOf = (s: Screen) => (s === "guild_members" || s === "guild_war" ? s : "ranking");

type Row = ReadRow & { file: string };

/** Downscale in the browser so each upload stays well under the server's limit. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85),
  );
}

export function ScreenshotReader({
  weekStart,
  members,
  contentKeys,
  onApply,
  t,
}: {
  weekStart: string;
  members: { id: number; ign: string }[];
  /** Content keys that have columns in this week's grid. */
  contentKeys: string[];
  onApply: (updates: GridUpdate[], runs: GridRuns) => void;
  t: Dictionary["reader"];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const end = weekEnd(weekStart);
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("guild_members");
  const [day, setDay] = useState(today < weekStart ? weekStart : today > end ? end : today);
  const [rows, setRows] = useState<Row[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const isGuildWarDay = GUILD_WAR_DAYS.includes(new Date(day).getUTCDay());
  const needsAdvent = screen.startsWith("advent") ? "advent_expedition" : screen === "god" ? "advent_god" : null;
  const blocked =
    screen === "guild_war" && !isGuildWarDay
      ? t.notGuildWarDay
      : needsAdvent && !contentKeys.includes(needsAdvent)
        ? t.noAdventThisWeek
        : null;

  // One row per member; a later screenshot of the same member wins.
  const byMember = useMemo(() => {
    const map = new Map<number, Row>();
    for (const r of rows) if (r.memberId !== null) map.set(r.memberId, r);
    return map;
  }, [rows]);
  const unseen = members.filter((m) => !byMember.has(m.id));
  const nameOf = (id: number) => members.find((m) => m.id === id)?.ign ?? "";

  function reset(next: Partial<{ screen: Screen; day: string }>) {
    if (next.screen) setScreen(next.screen);
    if (next.day) setDay(next.day);
    setRows([]);
    setMessage(null);
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    if (!files.length) return;
    setMessage(null);
    setProgress({ done: 0, total: files.length });
    let failed = 0;
    let error: string | null = null;
    // One at a time: the free model tier allows only a few requests a minute.
    for (const [i, file] of files.entries()) {
      try {
        const form = new FormData();
        form.set("image", await shrink(file), "screen.jpg");
        form.set("kind", kindOf(screen));
        form.set("week", weekStart);
        const result = await readScreen(form);
        if ("error" in result) {
          failed += 1;
          error = result.error;
        } else {
          setRows((prev) => [...prev, ...result.rows.map((r) => ({ ...r, file: file.name }))]);
        }
      } catch {
        failed += 1;
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    if (failed) {
      const reason = error === "busy" ? t.busy : error === "no_key" ? t.noKey : t.failed;
      setMessage({ tone: "error", text: t.someFailed.replace("{n}", String(failed)) + " " + reason });
    }
  }

  function assign(index: number, memberId: number | null) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, memberId } : r)));
  }

  async function apply() {
    const read = [...byMember.values()];
    const updates: GridUpdate[] = [];
    const daily: { key: string; marks: DayMark[]; use: "missed" | "value" }[] = [];
    const heldRuns: GridRuns["runs"] = [];

    if (screen === "guild_members") {
      daily.push({ key: "checkin_donation", marks: read.map((r) => ({ memberId: r.memberId!, done: r.checked_in ?? null })), use: "missed" });
      if (isGuildWarDay) {
        daily.push({
          key: "guild_war",
          marks: read.map((r) => ({ memberId: r.memberId!, done: (r.wins ?? 0) + (r.losses ?? 0) >= GUILD_WAR_ATTACKS })),
          use: "missed",
        });
      }
      // The castle badge counts this week's days so far, so it sets the week directly:
      // runs are the days from Monday through the day shown.
      if (read.some((r) => r.castle_done != null)) {
        const runs = Math.round((Date.parse(day) - Date.parse(weekStart)) / 86_400_000) + 1;
        heldRuns.push({ contentKey: "castle_rush", runs });
        for (const r of read) {
          if (r.castle_done != null) updates.push({ memberId: r.memberId!, contentKey: "castle_rush", missed: Math.max(0, runs - r.castle_done) });
        }
      }
    } else if (screen === "guild_war") {
      daily.push({
        key: "guild_war",
        marks: read.map((r) => ({ memberId: r.memberId!, done: (r.wins ?? 0) + (r.losses ?? 0) >= GUILD_WAR_ATTACKS })),
        use: "missed",
      });
    } else if (screen === "castle") {
      daily.push({ key: "castle_rush", marks: read.map((r) => ({ memberId: r.memberId!, value: r.damage ?? null })), use: "value" });
    } else if (screen === "god") {
      for (const r of read) {
        updates.push({
          memberId: r.memberId!,
          contentKey: "advent_god",
          missed: (r.attacks ?? 0) >= ADVENT_GOD_ATTACKS ? 0 : 1,
          score: { part: 0, value: r.damage ?? 0 },
        });
      }
    } else {
      const part = Number(screen.slice(-1)) - 1;
      for (const r of read) {
        updates.push({
          memberId: r.memberId!,
          contentKey: "advent_expedition",
          // Any attack on any boss counts; a boss list with no attack leaves the cell alone.
          ...((r.attacks ?? 0) > 0 || (r.damage ?? 0) > 0 ? { missed: 0 } : {}),
          score: { part, value: r.damage ?? 0 },
        });
      }
    }

    setApplying(true);
    for (const d of daily) {
      const result = await saveDayMarks(weekStart, day, d.key, d.marks);
      if (!result.ok) {
        setApplying(false);
        setMessage({ tone: "error", text: t.failed });
        return;
      }
      for (const w of result.week) {
        if (d.use === "missed") updates.push({ memberId: w.memberId, contentKey: d.key, missed: w.missed });
        else if (w.value != null) updates.push({ memberId: w.memberId, contentKey: d.key, score: { part: 0, value: w.value } });
      }
    }
    setApplying(false);
    onApply(updates, {
      days: daily
        .filter((d) => d.use === "missed" && d.marks.some((m) => m.done != null))
        .map((d) => ({ contentKey: d.key, day })),
      runs: heldRuns,
      values: daily
        .filter((d) => d.use === "value")
        .flatMap((d) => d.marks.flatMap((m) => (m.value != null ? [{ contentKey: d.key, day, memberId: m.memberId, value: m.value }] : []))),
    });
    setRows([]);
    setMessage({ tone: "ok", text: t.applied.replace("{n}", String(read.length)) });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${secondaryButton} self-start`}>
        <ImageUp className="size-4" aria-hidden />
        {t.open}
      </button>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{t.title}</h2>
          <p className="text-sm text-muted">{t.hint}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className={quietButton} aria-label={t.close}>
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t.screen}</span>
          <select value={screen} onChange={(e) => reset({ screen: e.target.value as Screen })} className={`${field} py-1.5`}>
            {SCREENS.map((s) => (
              <option key={s} value={s}>
                {t.screens[s]}
              </option>
            ))}
          </select>
        </label>
        {DAILY.includes(screen) && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{t.day}</span>
            <input
              type="date"
              min={weekStart}
              max={end}
              value={day}
              onChange={(e) => e.target.value && reset({ day: e.target.value })}
              className={`${field} py-1.5 tabular-nums`}
            />
          </label>
        )}
        <label className={`${primaryButton} cursor-pointer ${blocked || progress ? "pointer-events-none opacity-50" : ""}`}>
          {progress ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ImageUp className="size-4" aria-hidden />}
          {progress ? t.reading.replace("{a}", String(progress.done)).replace("{b}", String(progress.total)) : t.choose}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={Boolean(blocked || progress)}
            onChange={handleFiles}
            className="sr-only"
          />
        </label>
      </div>

      <p className="text-sm text-muted">{t.tips[screen]}</p>
      {blocked && <p className="text-sm text-warn">{blocked}</p>}

      {rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-normal">{t.readName}</th>
                  <th className="px-3 py-2 font-normal">{t.member}</th>
                  <th className="px-3 py-2 text-right font-normal">{t.values}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5">
                      {r.memberId !== null && nameOf(r.memberId).toLowerCase() !== r.name.toLowerCase() ? (
                        // A close-but-not-exact match: worth a second look.
                        <span className="text-warn" title={t.fuzzy}>
                          {r.name} ≈
                        </span>
                      ) : (
                        r.name
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <select
                        value={r.memberId ?? ""}
                        onChange={(e) => assign(i, e.target.value ? Number(e.target.value) : null)}
                        aria-label={`${r.name} ${t.member}`}
                        className={`${field} w-full py-1 ${r.memberId === null ? "border-warn" : ""}`}
                      >
                        <option value="">{t.skip}</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.ign}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-1.5 text-right whitespace-nowrap text-muted tabular-nums">{describe(r, t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {unseen.length > 0 && (
            <p className="text-sm text-muted">
              <span className="text-foreground">{t.unseen.replace("{n}", String(unseen.length))}</span>{" "}
              {unseen.map((m) => m.ign).join(", ")}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={apply} disabled={applying || Boolean(blocked) || !byMember.size} className={primaryButton}>
              {applying && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {t.apply.replace("{n}", String(byMember.size))}
            </button>
            <button type="button" onClick={() => reset({})} className={quietButton}>
              {t.clear}
            </button>
          </div>
        </>
      )}

      {message && (
        <p role="status" className={`text-sm ${message.tone === "ok" ? "text-ok" : "text-danger"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}

function describe(r: Row, t: Dictionary["reader"]) {
  const parts: string[] = [];
  if (r.checked_in != null) parts.push(r.checked_in ? t.checkedIn : t.notCheckedIn);
  if (r.castle_done != null) parts.push(t.castleDays.replace("{n}", String(r.castle_done)));
  if (r.wins != null || r.losses != null) parts.push(`W${r.wins ?? 0} / L${r.losses ?? 0}`);
  if (r.damage != null) parts.push(r.damage.toLocaleString());
  if (r.attacks != null && r.attacks > 0) parts.push(t.attacks.replace("{n}", String(r.attacks)));
  return parts.join(" · ");
}
