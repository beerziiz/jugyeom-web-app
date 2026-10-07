"use server";

import { createClient, getOfficer } from "@/lib/supabase/server";
import { matchMember } from "@/lib/match";
import { readScreenshot, ScreenshotError, type ScreenKind, type ScreenRow } from "@/lib/screenshot";
import { parseWeek, weekEnd } from "@/lib/week";

export type ReadRow = ScreenRow & { memberId: number | null };
export type ReadResult = { rows: ReadRow[] } | { error: "no_key" | "busy" | "failed" | "denied" };

const KINDS: ScreenKind[] = ["guild_members", "guild_war", "ranking"];

/** Reads one screenshot and matches each name to a member active that week. */
export async function readScreen(formData: FormData): Promise<ReadResult> {
  // The Gemini key is ours: only officers may spend it.
  if (!(await getOfficer())) return { error: "denied" };

  const image = formData.get("image");
  const kind = String(formData.get("kind")) as ScreenKind;
  const weekStart = parseWeek(String(formData.get("week") ?? ""));
  if (!(image instanceof Blob) || !KINDS.includes(kind)) return { error: "failed" };

  const supabase = await createClient();
  const [{ data: members }, rows] = await Promise.all([
    supabase
      .from("members")
      .select("id, ign")
      .lte("joined_at", weekEnd(weekStart))
      .or(`left_at.is.null,left_at.gte.${weekStart}`),
    readScreenshot(image, kind).catch((e) => (e instanceof ScreenshotError ? e.code : ("failed" as const))),
  ]);
  if (typeof rows === "string") return { error: rows };

  const roster = members ?? [];
  return { rows: rows.map((r) => ({ ...r, memberId: matchMember(r.name, roster)?.id ?? null })) };
}

export type DayMark = { memberId: number; done?: boolean | null; value?: number | null };

/**
 * Saves one day's results for one content and returns each member's week so far:
 * days marked missed, and the summed value (damage).
 */
export async function saveDayMarks(
  weekStartRaw: string,
  day: string,
  contentKey: string,
  marks: DayMark[],
): Promise<{ ok: true; week: { memberId: number; missed: number; value: number | null }[] } | { ok: false }> {
  const weekStart = parseWeek(weekStartRaw);
  const end = weekEnd(weekStart);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < weekStart || day > end) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: content } = await supabase.from("content_types").select("id").eq("key", contentKey).maybeSingle();
  if (!content) return { ok: false };

  if (marks.length) {
    const { error } = await supabase.from("day_marks").upsert(
      marks.map((m) => ({
        member_id: m.memberId,
        content_type_id: content.id,
        day,
        // Only overwrite what this screen actually showed.
        ...(m.done !== undefined ? { done: m.done } : {}),
        ...(m.value !== undefined ? { value: m.value } : {}),
        updated_by: user.id,
      })),
      { onConflict: "member_id,content_type_id,day" },
    );
    if (error) return { ok: false };
  }

  const { data: rows } = await supabase
    .from("day_marks")
    .select("member_id, done, value")
    .eq("content_type_id", content.id)
    .gte("day", weekStart)
    .lte("day", end);

  const week = new Map<number, { memberId: number; missed: number; value: number | null }>();
  for (const r of rows ?? []) {
    const w = week.get(r.member_id) ?? { memberId: r.member_id, missed: 0, value: null };
    if (r.done === false) w.missed += 1;
    if (r.value != null) w.value = (w.value ?? 0) + Number(r.value);
    week.set(r.member_id, w);
  }
  return { ok: true, week: [...week.values()] };
}
