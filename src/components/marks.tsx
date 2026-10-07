import type { CSSProperties, ReactNode } from "react";

// Run marks: slanted plates, one per run, like a series score.
// Attended runs fill in their content colour; a missed run is an empty red outline.
// The allowance row counts down the misses a member may still make this week.

type Size = "sm" | "md" | "lg";
const sizeClass = { sm: "mark-sm", md: "", lg: "mark-lg" } as const;

export function RunMarks({
  runs,
  missed,
  color,
  size = "md",
  label,
}: {
  runs: number;
  missed: number;
  color: string;
  size?: Size;
  label: string;
}) {
  const count = Math.max(runs, missed);
  const attended = Math.max(runs - missed, 0);
  return (
    <span role="img" aria-label={label} className="flex flex-wrap items-center gap-[3px]" style={{ "--mark": color } as CSSProperties}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden className={`mark ${sizeClass[size]} ${i < attended ? "mark-done" : "mark-gap"}`} />
      ))}
    </span>
  );
}

export function Allowance({
  missed,
  limit,
  size = "md",
  label,
  children,
}: {
  missed: number;
  limit: number;
  size?: Size;
  label: string;
  children?: ReactNode;
}) {
  const used = Math.min(missed, limit);
  // Once the limit is reached the week is a warning: every used plate turns solid red.
  const spent = missed >= limit ? "mark-over" : "mark-gap";
  const over = Math.max(missed - limit, 0);
  return (
    <span role="img" aria-label={label} className={`flex flex-wrap items-center ${size === "lg" ? "gap-1" : "gap-[3px]"}`}>
      {Array.from({ length: limit }, (_, i) => (
        <span key={i} aria-hidden className={`mark ${sizeClass[size]} ${i < limit - used ? "mark-life" : spent}`} />
      ))}
      {over > 0 && (
        <>
          <span aria-hidden className="mark-limit" />
          {Array.from({ length: over }, (_, i) => (
            <span key={`o${i}`} aria-hidden className={`mark ${sizeClass[size]} mark-over`} />
          ))}
        </>
      )}
      {children}
    </span>
  );
}
