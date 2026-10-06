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

/** Returns a valid Monday for the given query value, or this week's Monday. */
export function parseWeek(value: string | string[] | undefined): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return mondayOf(parsed);
  }
  return mondayOf(new Date());
}
