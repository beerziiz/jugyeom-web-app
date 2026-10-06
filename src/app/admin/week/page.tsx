import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { addWeeks, mondayOf, parseWeek, weekEnd } from "@/lib/week";
import { secondaryButton, quietButton } from "@/lib/ui";
import { WeekGrid, type GridContent, type GridEntry, type GridMember } from "./week-grid";

export default async function WeekPage({ searchParams }: PageProps<"/admin/week">) {
  const weekStart = parseWeek((await searchParams).w);
  const end = weekEnd(weekStart);
  const thisWeek = mondayOf(new Date());
  const { locale, t } = await getDictionary();
  const supabase = await createClient();

  const [{ data: members }, { data: contents }, { data: period }, { data: settings }] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, ign")
        .lte("joined_at", end)
        .or(`left_at.is.null,left_at.gte.${weekStart}`)
        .order("ign"),
      supabase
        .from("content_types")
        .select("id, name_en, name_th, has_score, score_label")
        .eq("active", true)
        .order("sort_order"),
      supabase.from("periods").select("id").eq("week_start", weekStart).maybeSingle(),
      supabase.from("settings").select("miss_threshold").maybeSingle(),
    ]);

  const { data: entries } = period
    ? await supabase
        .from("entries")
        .select("member_id, content_type_id, missed_count, score")
        .eq("period_id", period.id)
    : { data: [] };

  const gridContents: GridContent[] = (contents ?? []).map((c) => ({
    id: c.id,
    name: locale === "th" ? c.name_th : c.name_en,
    hasScore: c.has_score,
    scoreLabel: c.score_label,
  }));

  const gridEntries: GridEntry[] = (entries ?? []).map((e) => ({
    memberId: e.member_id,
    contentTypeId: e.content_type_id,
    missed: e.missed_count,
    score: e.score === null ? null : Number(e.score),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.week.title}</h1>
          <p className="text-muted tabular-nums">
            {t.week.weekOf} {weekStart} – {end}
          </p>
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
          threshold={settings?.miss_threshold ?? 3}
          t={t.week}
        />
      )}
    </div>
  );
}
