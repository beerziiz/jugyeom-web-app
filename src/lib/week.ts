// Weeks are identified by their Monday, as a YYYY-MM-DD string (UTC).

const DAY = 86_400_000;

export function mondayOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (d.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(d.getTime() - offset * DAY).toISOString().slice(0, 10);
}

export function addWeeks(weekStart: string, n: number): string {
  return new Date(Date.parse(weekStart) + n * 7 * DAY).toISOString().slice(0, 10);
}

export function weekEnd(weekStart: string): string {
  return new Date(Date.parse(weekStart) + 6 * DAY).toISOString().slice(0, 10);
}

/**
 * Whether content on a multi-week cycle is entered in this week. It is entered once,
 * in the last week of each cycle; weekly content is entered every week.
 */
export function isCycleEnd(weekStart: string, cycleWeeks: number, cycleStart: string | null): boolean {
  if (cycleWeeks <= 1 || !cycleStart) return true;
  const weeks = Math.round((Date.parse(weekStart) - Date.parse(mondayOf(new Date(cycleStart)))) / (7 * DAY));
  return ((weeks % cycleWeeks) + cycleWeeks) % cycleWeeks === cycleWeeks - 1;
}

/** Returns a valid Monday for the given query value, or this week's Monday. */
export function parseWeek(value: string | string[] | undefined): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return mondayOf(parsed);
  }
  return mondayOf(new Date());
}

/** "6–12 Oct" / "6–12 ต.ค." for a week starting on the given Monday. */
export function formatWeek(weekStart: string, locale: "th" | "en"): { start: string; end: string; short: string } {
  const fmt = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const start = fmt.format(new Date(weekStart));
  const end = fmt.format(new Date(weekEnd(weekStart)));
  return { start, end, short: start };
}
