"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseWeek } from "@/lib/week";

export type EntryInput = {
  memberId: number;
  contentTypeId: number;
  missed: number;
  score: number | null;
};

export async function saveWeek(
  weekStartRaw: string,
  entries: EntryInput[],
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
    const score = e.score === null || !Number.isFinite(e.score) ? null : e.score;
    return {
      member_id: e.memberId,
      period_id: period.id,
      content_type_id: e.contentTypeId,
      missed_count: missed,
      participated: missed === 0,
      score,
      source: "manual" as const,
      entered_by: user.id,
    };
  });

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
