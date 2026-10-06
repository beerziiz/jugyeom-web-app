import "server-only";
import { createClient } from "@/lib/supabase/server";
import { weekEnd } from "@/lib/week";
import { scoreLabel } from "@/lib/content";
import type { Locale } from "@/lib/i18n/dictionaries";

export type ContentInfo = {
  id: number;
  key: string;
  name: string;
  hasScore: boolean;
  scoreLabel: string | null;
  defaultRuns: number;
};

export type ContentResult = ContentInfo & {
  runs: number;
  missed: number;
  score: number | null;
  recorded: boolean;
};

export type MemberWeek = {
  id: number;
  ign: string;
  role: "leader" | "officer" | "member";
  missed: number;
  score: number;
  contents: ContentResult[];
};

type EntryRow = {
  member_id: number;
  period_id: number;
  content_type_id: number;
  missed_count: number;
  score: number | string | null;
};

// Usual runs per week, matching migration 0002, for databases that have not run it yet.
const FALLBACK_RUNS: Record<string, number> = {
  guild_war: 3,
  castle_rush: 7,
  advent_expedition: 2,
  checkin_donation: 7,
};

async function loadContents(locale: Locale): Promise<ContentInfo[]> {
  const supabase = await createClient();
  const withRuns = await supabase
    .from("content_types")
    .select("id, key, name_en, name_th, has_score, score_label, default_runs")
    .eq("active", true)
    .order("sort_order");

  // Before migration 0002 runs, default_runs does not exist yet.
  const data = withRuns.error
    ? ((
        await supabase
          .from("content_types")
          .select("id, key, name_en, name_th, has_score, score_label")
          .eq("active", true)
          .order("sort_order")
      ).data?.map((c) => ({ ...c, default_runs: FALLBACK_RUNS[c.key] ?? 1 })) ?? [])
    : withRuns.data;

  return (data ?? []).map((c) => ({
    id: c.id,
    key: c.key,
    name: locale === "th" ? c.name_th : c.name_en,
    hasScore: c.has_score,
    scoreLabel: scoreLabel(c.score_label, locale, locale === "th" ? "คะแนน" : "Score"),
    defaultRuns: c.default_runs ?? 1,
  }));
}

function buildResults(
  contents: ContentInfo[],
  runsByContent: Map<number, number>,
  entries: EntryRow[],
): { contents: ContentResult[]; missed: number; score: number } {
  const byContent = new Map(entries.map((e) => [e.content_type_id, e]));
  const results = contents.map((c) => {
    const e = byContent.get(c.id);
    return {
      ...c,
      runs: runsByContent.get(c.id) ?? c.defaultRuns,
      missed: e?.missed_count ?? 0,
      score: e?.score == null ? null : Number(e.score),
      recorded: Boolean(e),
    };
  });
  return {
    contents: results,
    missed: results.reduce((sum, r) => sum + r.missed, 0),
    score: results.reduce((sum, r) => sum + (r.score ?? 0), 0),
  };
}

/** The guild board for one recorded week (latest by default). */
export async function loadBoard(locale: Locale, requestedWeek?: string) {
  const supabase = await createClient();

  const [contents, { data: periods }, { data: settings }] = await Promise.all([
    loadContents(locale),
    supabase.from("periods").select("id, week_start").order("week_start", { ascending: false }).limit(12),
    supabase.from("settings").select("miss_threshold").maybeSingle(),
  ]);

  const threshold = settings?.miss_threshold ?? 3;
  const recent = periods ?? [];
  const period = recent.find((p) => p.week_start === requestedWeek) ?? recent[0] ?? null;

  if (!period) {
    return { contents, threshold, periods: recent, period: null, members: [] as MemberWeek[] };
  }

  const end = weekEnd(period.week_start);
  const [{ data: members }, { data: entries }, { data: runs }] = await Promise.all([
    supabase
      .from("members")
      .select("id, ign, role")
      .lte("joined_at", end)
      .or(`left_at.is.null,left_at.gte.${period.week_start}`)
      .order("ign"),
    supabase
      .from("entries")
      .select("member_id, period_id, content_type_id, missed_count, score")
      .eq("period_id", period.id),
    supabase.from("period_contents").select("content_type_id, runs_held").eq("period_id", period.id),
  ]);

  const runsByContent = new Map((runs ?? []).map((r) => [r.content_type_id, r.runs_held]));
  const entriesByMember = new Map<number, EntryRow[]>();
  for (const e of (entries ?? []) as EntryRow[]) {
    entriesByMember.set(e.member_id, [...(entriesByMember.get(e.member_id) ?? []), e]);
  }

  const rows: MemberWeek[] = (members ?? []).map((m) => ({
    id: m.id,
    ign: m.ign,
    role: m.role,
    ...buildResults(contents, runsByContent, entriesByMember.get(m.id) ?? []),
  }));

  return { contents, threshold, periods: recent, period, members: rows };
}

/** One member with every recorded week, newest first. */
export async function loadMember(locale: Locale, memberId: number) {
  const supabase = await createClient();

  const [contents, { data: member }, { data: settings }] = await Promise.all([
    loadContents(locale),
    supabase.from("members").select("id, ign, role, joined_at, left_at").eq("id", memberId).maybeSingle(),
    supabase.from("settings").select("miss_threshold").maybeSingle(),
  ]);

  const threshold = settings?.miss_threshold ?? 3;
  if (!member) return { contents, threshold, member: null, weeks: [] };

  const { data: entries } = await supabase
    .from("entries")
    .select("member_id, period_id, content_type_id, missed_count, score")
    .eq("member_id", memberId);

  const periodIds = [...new Set((entries ?? []).map((e) => e.period_id))];
  const [{ data: periods }, { data: runs }] = periodIds.length
    ? await Promise.all([
        supabase.from("periods").select("id, week_start").in("id", periodIds),
        supabase.from("period_contents").select("period_id, content_type_id, runs_held").in("period_id", periodIds),
      ])
    : [{ data: [] }, { data: [] }];

  const weeks = (periods ?? [])
    .sort((a, b) => b.week_start.localeCompare(a.week_start))
    .map((p) => {
      const runsByContent = new Map(
        (runs ?? []).filter((r) => r.period_id === p.id).map((r) => [r.content_type_id, r.runs_held]),
      );
      const weekEntries = ((entries ?? []) as EntryRow[]).filter((e) => e.period_id === p.id);
      return { weekStart: p.week_start, ...buildResults(contents, runsByContent, weekEntries) };
    });

  return { contents, threshold, member, weeks };
}
