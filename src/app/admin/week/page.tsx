import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { addWeeks, isCycleEnd, mondayOf, parseWeek, today, weekEnd } from "@/lib/week";
import { secondaryButton, quietButton } from "@/lib/ui";
import { WeekGrid, type GridContent, type GridDayValue, type GridEntry, type GridMember } from "./week-grid";

export default async function WeekPage({ searchParams }: PageProps<"/admin/week">) {
  const weekStart = parseWeek((await searchParams).w);
  const end = weekEnd(weekStart);
  const thisWeek = mondayOf(new Date(today()));
  const { locale, t } = await getDictionary();
  const supabase = await createClient();

  const [{ data: members }, { data: contents }, { data: period }, { data: settings }, { data: marks }] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, ign")
        .lte("joined_at", end)
        .or(`left_at.is.null,left_at.gte.${weekStart}`)
        .order("ign"),
      supabase
        .from("content_types")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
      supabase.from("periods").select("id").eq("week_start", weekStart).maybeSingle(),
      supabase.from("settings").select("miss_threshold").maybeSingle(),
      // Results per day read from screenshots; these can exist before the week is first saved.
      supabase
        .from("day_marks")
        .select("member_id, content_type_id, day, done, value")
        .gte("day", weekStart)
        .lte("day", end),
    ]);

  const [{ data: entries }, { data: runs }] = period
    ? await Promise.all([
        supabase
          .from("entries")
          .select("*")
          .eq("period_id", period.id),
        supabase.from("period_contents").select("content_type_id, runs_held").eq("period_id", period.id),
      ])
    : [{ data: [] }, { data: [] }];

  const runsByContent = new Map((runs ?? []).map((r) => [r.content_type_id, r.runs_held]));
  const daysByContent = new Map<number, Set<string>>();
  for (const m of marks ?? []) {
    if (m.done === null && m.value === null) continue;
    daysByContent.set(m.content_type_id, (daysByContent.get(m.content_type_id) ?? new Set()).add(m.day));
  }
  const dayValues: GridDayValue[] = (marks ?? [])
    .filter((m) => m.value !== null)
    .map((m) => ({ memberId: m.member_id, contentTypeId: m.content_type_id, day: m.day, value: Number(m.value) }));

  // Content on a multi-week cycle is entered only in the cycle’s last week.
  const dueThisWeek = (c: NonNullable<typeof contents>[number]) =>
    isCycleEnd(weekStart, c.cycle_weeks ?? 1, c.cycle_start ?? null);
  const nameOf = (c: NonNullable<typeof contents>[number]) => (locale === "th" ? c.name_th : c.name_en);
  const laterNames = (contents ?? []).filter((c) => !dueThisWeek(c)).map(nameOf);

  const gridContents: GridContent[] = (contents ?? []).filter(dueThisWeek).map((c) => ({
    id: c.id,
    name: nameOf(c),
    key: c.key,
    hasScore: c.has_score,
    scoreLabel: c.score_label,
    scoreParts: c.has_score ? (c.score_parts ?? 1) : 0,
    runs: runsByContent.get(c.id) ?? c.default_runs ?? 1,
    days: [...(daysByContent.get(c.id) ?? [])].sort(),
  }));

  const gridEntries: GridEntry[] = (entries ?? []).map((e) => ({
    memberId: e.member_id,
    contentTypeId: e.content_type_id,
    missed: e.missed_count,
    score: e.score === null ? null : Number(e.score),
    scoreParts: e.score_parts?.map((v: number | string | null) => (v === null ? null : Number(v))) ?? null,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{t.week.title}</h1>
          <p className="text-muted tabular-nums">
            {t.week.weekOf} {weekStart} – {end}
          </p>
          {laterNames.length > 0 && (
            <p className="text-sm text-muted">
              {t.week.nextWeek.replace("{names}", laterNames.join(", ")).replace("{date}", addWeeks(weekStart, 1))}
            </p>
          )}
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href={`/admin/week?w=${addWeeks(weekStart, -1)}`}
            className={secondaryButton}
            aria-label={t.week.prev}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
          {weekStart !== thisWeek && (
            <Link href="/admin/week" className={quietButton}>
              {t.week.current}
            </Link>
          )}
          <Link
            href={`/admin/week?w=${addWeeks(weekStart, 1)}`}
            className={secondaryButton}
            aria-label={t.week.next}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </nav>
      </div>

      {!members?.length ? (
        <p className="text-muted">
          {t.week.noMembers}{" "}
          <Link href="/admin/members" className="text-accent underline">
            {t.admin.navMembers}
          </Link>
        </p>
      ) : (
        <WeekGrid
          key={weekStart}
          weekStart={weekStart}
          recorded={Boolean(period)}
          members={members as GridMember[]}
          contents={gridContents}
          entries={gridEntries}
          dayValues={dayValues}
          threshold={settings?.miss_threshold ?? 5}
          t={t.week}
          tr={t.reader}
        />
      )}
    </div>
  );
}
