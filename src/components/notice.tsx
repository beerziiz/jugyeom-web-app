import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentResult } from "@/lib/board";
import { contentColor, formatScore } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Seal, Seals } from "./seals";

type T = Dictionary["board"];

const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** Verdict line shared by the big and mini notices. */
export function verdict(missed: number, threshold: number, t: T) {
  if (missed >= threshold) return { tone: "warn" as const, text: t.atLimit };
  if (missed === 0) return { tone: "ok" as const, text: t.clean };
  const left = threshold - missed;
  return { tone: "mid" as const, text: fill(left === 1 ? t.left : t.leftMany, { n: left }) };
}

/** The visitor's own week, pinned to the top of the board. */
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
    <article
      className={`relative rounded-[5px] bg-surface px-5 pt-7 pb-5 shadow-[0_2px_0_oklch(0_0_0/0.25),0_18px_32px_-18px_oklch(0_0_0/0.8)] ${
        over ? "ring-2 ring-seal" : ""
      }`}
    >
      <span aria-hidden className="pin absolute -top-[7px] left-1/2 size-[14px] -translate-x-1/2" />

      <header className="flex items-baseline justify-between gap-4">
        <Heading className="min-w-0 truncate font-display text-[1.6rem] leading-tight font-bold">{name}</Heading>
        <span className="shrink-0 text-sm text-muted">{role}</span>
      </header>

      <p
        className={`mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 rounded-[4px] px-3 py-2.5 ${
          v.tone === "warn" ? "bg-seal-bg text-seal" : v.tone === "ok" ? "bg-surface-2 text-ok" : "bg-surface-2"
        }`}
      >
        <strong className="font-semibold">{fill(t.missedOf, { n: missed, limit: threshold })}</strong>
        <span className={v.tone === "mid" ? "text-muted" : ""}>{v.text}</span>
      </p>

      <ul className="mt-2">
        {contents.map((c) => (
          <li key={c.id} className="border-t border-dashed border-border py-3 first:border-t-0">
            <div className="flex items-center justify-between gap-3 text-[0.95rem]">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ background: contentColor(c.key) }} />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="shrink-0 text-sm text-muted">
                {c.hasScore && c.score != null
                  ? `${c.scoreLabel ?? t.total} ${formatScore(c.score)}`
                  : fill(t.runs, { a: Math.max(c.runs - c.missed, 0), b: c.runs })}
              </span>
            </div>
            <div className="mt-2">
              <Seals total={c.runs} missed={c.missed} label={fill(t.missedRuns, { n: c.missed, b: c.runs })} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center gap-3 border-t border-border pt-4 text-sm text-muted">
        <span>{t.limit}</span>
        <span role="img" aria-label={fill(t.missedOf, { n: missed, limit: threshold })} className="flex items-center gap-1.5">
          {Array.from({ length: threshold }, (_, i) => (
            <Seal key={i} index={i + 3} missed={i < missed} size={26} />
          ))}
          <span aria-hidden className="mx-1 h-8 w-0.5 bg-foreground" />
          {Array.from({ length: Math.max(missed - threshold, 0) }, (_, i) => (
            <Seal key={`o${i}`} index={i + 5} missed size={26} />
          ))}
        </span>
        <span className={`ml-auto ${over ? "font-semibold text-seal" : ""}`}>
          {missed}/{threshold}
        </span>
      </div>

      {footer && <div className="mt-4 border-t border-border pt-3 text-sm">{footer}</div>}
    </article>
  );
}

/** A small notice on the board: name and a seal per miss up to the limit. */
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
      className={`group relative block rounded-[3px] bg-surface px-3 pt-3.5 pb-3 shadow-[0_10px_18px_-12px_oklch(0_0_0/0.9)] transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-surface-2 ${
        over ? "ring-2 ring-seal" : highlight ? "ring-1 ring-brass" : ""
      }`}
    >
      <span aria-hidden className="pin absolute -top-1 left-1/2 size-2 -translate-x-1/2" />
      <span className="block truncate font-display text-[1.05rem] font-bold">{name}</span>
      <span className="mt-2 flex items-center justify-between gap-2">
        <Seals total={threshold} missed={missed} size={12} label={fill(t.missedOf, { n: missed, limit: threshold })} />
        <span className={`text-xs ${over ? "font-semibold text-seal" : "text-muted"}`}>
          {missed}/{threshold}
        </span>
      </span>
    </Link>
  );
}

export { fill };
