import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { ContentResult } from "@/lib/board";
import { contentColor, formatScore } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Allowance, RunMarks } from "./marks";

type T = Dictionary["board"];

const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** Verdict line shared by the player card and the board cards. */
export function verdict(missed: number, threshold: number, t: T) {
  if (missed >= threshold) return { tone: "warn" as const, text: t.atLimit };
  if (missed === 0) return { tone: "ok" as const, text: t.clean };
  const left = threshold - missed;
  return { tone: "mid" as const, text: fill(left === 1 ? t.left : t.leftMany, { n: left }) };
}

/** Short allowance note beside the lives row: "2 left", "At the limit", "1 over". */
function allowanceNote(missed: number, threshold: number, t: T) {
  const left = threshold - missed;
  if (left > 0) return fill(t.allowance, { n: left });
  return left === 0 ? t.atLimitShort : fill(t.overBy, { n: -left });
}

/** One member's week as a player card: score, allowance, then a row per content. */
export function Notice({
  name,
  role,
  missed,
  threshold,
  contents,
  t,
  footer,
  as: Heading = "h2",
}: {
  name: string;
  role: string;
  missed: number;
  threshold: number;
  contents: ContentResult[];
  t: T;
  footer?: ReactNode;
  as?: "h1" | "h2";
}) {
  const v = verdict(missed, threshold, t);
  const over = missed >= threshold;

  return (
    <article className={`overflow-hidden rounded-[4px] bg-surface ${over ? "ring-2 ring-miss" : ""}`}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-1 px-5 pt-5 pb-3.5">
        <Heading className="headline min-w-0 truncate text-[2rem] leading-[1.1]">{name}</Heading>
        <p className="row-span-2 text-right leading-none font-display font-semibold">
          <span className={`text-[3.2rem] font-extrabold italic ${over ? "text-miss" : ""}`}>{missed}</span>
          <span className="text-xl text-muted">/{threshold}</span>
        </p>
        <span className="text-sm text-muted">
          {role} · {t.youMissed}
        </span>
      </header>

      <div className="px-5 pb-3.5">
        <Allowance missed={missed} limit={threshold} size="lg" label={fill(t.missedOf, { n: missed, limit: threshold })}>
          <span className={`ml-2.5 text-sm whitespace-nowrap ${over ? "font-semibold text-miss" : ""}`}>
            {allowanceNote(missed, threshold, t)}
          </span>
        </Allowance>
      </div>

      <p
        className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-5 py-2.5 ${
          v.tone === "warn" ? "bg-miss-bg text-miss" : "bg-surface-2"
        }`}
      >
        <strong className="font-semibold">{fill(t.missedOf, { n: missed, limit: threshold })}</strong>
        <span className={v.tone === "ok" ? "text-ok" : ""}>{v.text}</span>
      </p>

      <ul className="px-5 pt-1 pb-1.5">
        {contents.map((c) => (
          <li key={c.id} className="border-t border-border py-3 first:border-t-0">
            <div className="flex items-center justify-between gap-3 text-base">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span aria-hidden className="h-4 w-1 shrink-0 -skew-x-[18deg] rounded-[1px]" style={{ background: contentColor(c.key) }} />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="shrink-0 text-sm text-muted">
                {c.hasScore && c.score != null
                  ? `${c.scoreLabel ?? t.total} ${formatScore(c.score)}`
                  : fill(t.runs, { a: Math.max(c.runs - c.missed, 0), b: c.runs })}
              </span>
            </div>
            <div className="mt-2">
              <RunMarks runs={c.runs} missed={c.missed} color={contentColor(c.key)} label={fill(t.missedRuns, { n: c.missed, b: c.runs })} />
            </div>
          </li>
        ))}
      </ul>

      <p aria-hidden className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border px-5 py-2.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="mark mark-sm mark-done" style={{ "--mark": "var(--c-guild-war)" } as CSSProperties} />
          {t.legendDone}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="mark mark-sm mark-gap" />
          {t.legendMissed}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="mark mark-sm mark-life" />
          {t.legendLeft}
        </span>
      </p>

      {footer && <div className="border-t border-border px-5 py-3 text-sm">{footer}</div>}
    </article>
  );
}

/** A small card on the board: name, the week's allowance and the missed count. */
export function MiniNotice({
  href,
  name,
  missed,
  threshold,
  t,
  highlight,
}: {
  href: string;
  name: string;
  missed: number;
  threshold: number;
  t: T;
  highlight?: boolean;
}) {
  const over = missed >= threshold;
  return (
    <Link
      href={href}
      className={`block rounded-[4px] p-3 transition-colors duration-150 ${over ? "bg-miss-bg hover:bg-surface-2" : "bg-surface hover:bg-surface-2"} ${
        highlight ? "ring-1 ring-live ring-inset" : ""
      }`}
    >
      <span className="headline block truncate text-[1.1rem] leading-snug">{name}</span>
      <span className="mt-2 flex items-center justify-between gap-2">
        <Allowance missed={missed} limit={threshold} size="sm" label={fill(t.missedOf, { n: missed, limit: threshold })} />
        <span className={`font-display text-base font-semibold ${over ? "text-miss" : ""}`}>
          {missed}/{threshold}
        </span>
      </span>
    </Link>
  );
}

export { fill };
