// One flat colour per content type, used on every screen (board, member page, entry grid).
// Keys match content_types.key in the database.

export const contentColors: Record<string, string> = {
  guild_war: "var(--c-guild-war)",
  castle_rush: "var(--c-castle-rush)",
  advent_expedition: "var(--c-advent)",
  advent_god: "var(--c-advent)",
  checkin_donation: "var(--c-checkin)",
};

export function contentColor(key: string) {
  return contentColors[key] ?? "var(--muted)";
}

export function formatScore(value: number | null | undefined) {
  if (value == null) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

const scoreLabelsTh: Record<string, string> = { Score: "คะแนน", Damage: "ดาเมจ", Points: "แต้ม" };

export function scoreLabel(label: string | null, locale: "th" | "en", fallback: string) {
  if (!label) return fallback;
  return locale === "th" ? (scoreLabelsTh[label] ?? label) : label;
}

/** Guild War runs on Monday, Wednesday and Saturday (Date#getUTCDay numbering). */
export const GUILD_WAR_DAYS = [1, 3, 6];

/** Attacks a member must use for a Guild War day, or the God of Destruction, to count. */
export const GUILD_WAR_ATTACKS = 3;
export const ADVENT_GOD_ATTACKS = 3;

/**
 * Daily content whose runs held are the days with a screenshot on record,
 * so officers never type them. Castle Rush is held every day instead: its runs
 * are the days up to the guild member screenshot that showed the N/7 badge.
 */
export const COUNTED_BY_DAY = ["guild_war", "checkin_donation"];
export const EVERY_DAY = ["castle_rush"];

/** Whether the content is scheduled on this day (YYYY-MM-DD). */
export function isHeldOn(contentKey: string, day: string) {
  return contentKey !== "guild_war" || GUILD_WAR_DAYS.includes(new Date(day).getUTCDay());
}
