"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseWeek, weekEnd } from "@/lib/week";

export type EntryInput = {
  memberId: number;
  contentTypeId: number;
  missed: number;
  score: number | null;
  /** Damage per boss when the content splits its score; null otherwise. */
  scoreParts?: (number | null)[] | null;
};

export type DayValueInput = { memberId: number; contentTypeId: number; day: string; value: number | null };

export async function saveWeek(
  weekStartRaw: string,
  entries: EntryInput[],
  runs: { contentTypeId: number; runs: number }[] = [],
  dayValues: DayValueInput[] = [],
): Promise<{ ok: boolean }> {
  const weekStart = parseWeek(weekStartRaw);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: period, error: periodError } = await supabase
    .from("periods")
    .upsert({ week_start: weekStart }, { onConflict: "week_start" })
    .select("id")
    .single();
  if (periodError || !period) return { ok: false };

  const rows = entries.map((e) => {
    const missed = Math.max(0, Math.min(99, Math.trunc(e.missed) || 0));
    const clean = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? null : v);
    const score = clean(e.score);
    return {
      member_id: e.memberId,
      period_id: period.id,
      content_type_id: e.contentTypeId,
      missed_count: missed,
      participated: missed === 0,
      score,
      ...(e.scoreParts ? { score_parts: e.scoreParts.map(clean) } : {}),
      source: "manual" as const,
      entered_by: user.id,
    };
  });

  if (runs.length) {
    const { error } = await supabase.from("period_contents").upsert(
      runs.map((r) => ({
        period_id: period.id,
        content_type_id: r.contentTypeId,
        runs_held: Math.max(0, Math.min(31, Math.trunc(r.runs) || 0)),
      })),
      { onConflict: "period_id,content_type_id" },
    );
    if (error) return { ok: false };
  }

  // Damage per day (Castle Rush); only the value is written, so attendance read from screenshots stays.
  if (dayValues.length) {
    const end = weekEnd(weekStart);
    const { error } = await supabase.from("day_marks").upsert(
      dayValues
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.day) && d.day >= weekStart && d.day <= end)
        .map((d) => ({
          member_id: d.memberId,
          content_type_id: d.contentTypeId,
          day: d.day,
          value: d.value == null || !Number.isFinite(d.value) ? null : d.value,
          updated_by: user.id,
        })),
      { onConflict: "member_id,content_type_id,day" },
    );
    if (error) return { ok: false };
  }

  if (rows.length) {
    const { error } = await supabase
      .from("entries")
      .upsert(rows, { onConflict: "member_id,period_id,content_type_id" });
    if (error) return { ok: false };
  }

  revalidatePath("/admin/week");
  revalidatePath("/");
  return { ok: true };
}
