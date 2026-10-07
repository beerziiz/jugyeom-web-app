import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/dictionaries";

export type WarningStatus = "open" | "cleared" | "kicked";

/** What a member missed in one week, so every warning traces back to entries. */
export type MissedWeek = {
  periodId: number;
  weekStart: string;
  misses: number;
  breakdown: { key: string; name: string; missed: number }[];
};

export type PendingWarning = MissedWeek & { memberId: number; ign: string };

export type WarnedMember = {
  memberId: number;
  ign: string;
  warnings: (MissedWeek & { id: number; status: WarningStatus })[];
};

/**
 * Everything the officers' warnings page needs:
 * - pending: weeks where an active member reached the limit and no officer has decided yet
 * - candidates: active members whose open warnings reached the kick limit
 * - warned: active members with open warnings below the kick limit
 */
export async function loadWarnings(locale: Locale) {
  const supabase = await createClient();

  const [{ data: settings }, { data: members }, { data: over }, { data: warnings }, { data: contents }] =
    await Promise.all([
      supabase.from("settings").select("miss_threshold, kick_after_warnings").maybeSingle(),
      supabase.from("members").select("id, ign").is("left_at", null),
      supabase
        .from("weekly_misses")
        .select("member_id, period_id, week_start, misses")
        .eq("over_threshold", true),
      supabase.from("warnings").select("id, member_id, period_id, misses, status"),
      supabase.from("content_types").select("id, key, name_en, name_th, sort_order").order("sort_order"),
    ]);

  const threshold = settings?.miss_threshold ?? 5;
  const kickAfter = settings?.kick_after_warnings ?? 2;
  const igns = new Map((members ?? []).map((m) => [m.id, m.ign as string]));
  const activeWarnings = (warnings ?? []).filter((w) => igns.has(w.member_id));

  // Weeks referenced by a flag or a warning, with the per-content breakdown of misses.
  const periodIds = [...new Set([...(over ?? []).map((o) => o.period_id), ...activeWarnings.map((w) => w.period_id)])];
  const [{ data: periods }, { data: entries }] = periodIds.length
    ? await Promise.all([
        supabase.from("periods").select("id, week_start").in("id", periodIds),
        supabase
          .from("entries")
          .select("member_id, period_id, content_type_id, missed_count")
          .in("period_id", periodIds)
          .gt("missed_count", 0),
      ])
    : [{ data: [] }, { data: [] }];

  const weekOf = new Map((periods ?? []).map((p) => [p.id, p.week_start as string]));
  const order = new Map((contents ?? []).map((c, i) => [c.id, i]));
  const contentById = new Map(
    (contents ?? []).map((c) => [c.id, { key: c.key as string, name: (locale === "th" ? c.name_th : c.name_en) as string }]),
  );

  function missedWeek(memberId: number, periodId: number, misses: number): MissedWeek {
    const breakdown = (entries ?? [])
      .filter((e) => e.member_id === memberId && e.period_id === periodId)
      .sort((a, b) => (order.get(a.content_type_id) ?? 0) - (order.get(b.content_type_id) ?? 0))
      .flatMap((e) => {
        const c = contentById.get(e.content_type_id);
        return c ? [{ ...c, missed: e.missed_count as number }] : [];
      });
    return { periodId, weekStart: weekOf.get(periodId) ?? "", misses, breakdown };
  }

  const decided = new Set((warnings ?? []).map((w) => `${w.member_id}:${w.period_id}`));
  const pending: PendingWarning[] = (over ?? [])
    .filter((o) => igns.has(o.member_id) && !decided.has(`${o.member_id}:${o.period_id}`))
    .map((o) => ({ memberId: o.member_id, ign: igns.get(o.member_id)!, ...missedWeek(o.member_id, o.period_id, o.misses) }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart) || b.misses - a.misses || a.ign.localeCompare(b.ign));

  const byMember = new Map<number, WarnedMember>();
  for (const w of activeWarnings) {
    if (w.status !== "open") continue;
    const entry: WarnedMember = byMember.get(w.member_id) ?? { memberId: w.member_id, ign: igns.get(w.member_id)!, warnings: [] };
    entry.warnings.push({ id: w.id, status: w.status, ...missedWeek(w.member_id, w.period_id, w.misses) });
    byMember.set(w.member_id, entry);
  }
  const all = [...byMember.values()]
    .map((m) => ({ ...m, warnings: m.warnings.sort((a, b) => b.weekStart.localeCompare(a.weekStart)) }))
    .sort((a, b) => b.warnings.length - a.warnings.length || a.ign.localeCompare(b.ign));

  return {
    threshold,
    kickAfter,
    pending,
    candidates: all.filter((m) => m.warnings.length >= kickAfter),
    warned: all.filter((m) => m.warnings.length < kickAfter),
  };
}
