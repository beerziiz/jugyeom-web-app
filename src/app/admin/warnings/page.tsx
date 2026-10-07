import Link from "next/link";
import { contentColor } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { primaryButton, quietButton, secondaryButton } from "@/lib/ui";
import { loadWarnings, type MissedWeek, type WarnedMember } from "@/lib/warnings";
import { formatWeek } from "@/lib/week";
import { ActionButton } from "./action-button";
import { clearWarning, decideWarning, kickMember } from "./actions";

type T = Dictionary["warnings"];
const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export default async function WarningsPage() {
  const { locale, t } = await getDictionary();
  const tw = t.warnings;
  const { threshold, kickAfter, pending, candidates, warned } = await loadWarnings(locale);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{tw.title}</h1>
        <p className="text-muted">{fill(tw.rules, { n: threshold, k: kickAfter })}</p>
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle title={tw.pending} count={pending.length} tone={pending.length ? "warn" : "muted"} />
        <p className="text-sm text-muted">{tw.pendingHint}</p>
        {pending.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {pending.map((p) => (
              <li key={`${p.memberId}:${p.periodId}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1 basis-64">
                  <MemberLink id={p.memberId} ign={p.ign} />
                  <Week week={p} locale={locale} t={tw} />
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    action={decideWarning.bind(null, p.memberId, p.periodId, p.misses, false)}
                    className={secondaryButton}
                  >
                    {tw.dismiss}
                  </ActionButton>
                  <ActionButton
                    action={decideWarning.bind(null, p.memberId, p.periodId, p.misses, true)}
                    className={primaryButton}
                  >
                    {tw.warn}
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ok">{tw.nonePending}</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle title={tw.kickList} count={candidates.length} tone={candidates.length ? "warn" : "muted"} />
        <p className="text-sm text-muted">{fill(tw.kickHint, { k: kickAfter })}</p>
        {candidates.length ? (
          <ul className="flex flex-col gap-3">
            {candidates.map((m) => (
              <WarnedCard key={m.memberId} member={m} kickAfter={kickAfter} locale={locale} t={tw} kick />
            ))}
          </ul>
        ) : (
          <p className="text-ok">{tw.noneKick}</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle title={tw.warned} count={warned.length} tone="muted" />
        {warned.length ? (
          <ul className="flex flex-col gap-3">
            {warned.map((m) => (
              <WarnedCard key={m.memberId} member={m} kickAfter={kickAfter} locale={locale} t={tw} />
            ))}
          </ul>
        ) : (
          <p className="text-muted">{tw.noneWarned}</p>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ title, count, tone }: { title: string; count: number; tone: "warn" | "muted" }) {
  return (
    <h2 className="text-lg font-semibold">
      {title}{" "}
      <span className={`font-normal tabular-nums ${tone === "warn" ? "text-warn" : "text-muted"}`}>({count})</span>
    </h2>
  );
}

function MemberLink({ id, ign }: { id: number; ign: string }) {
  return (
    <Link href={`/m/${id}`} className="font-semibold hover:text-accent hover:underline">
      {ign}
    </Link>
  );
}

/** "6–12 Oct · missed 6" plus which content the misses came from. */
function Week({ week, locale, t }: { week: MissedWeek; locale: "th" | "en"; t: T }) {
  const label = formatWeek(week.weekStart, locale);
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="tabular-nums text-muted">
        {label.start} – {label.end}
      </span>
      <strong className="font-semibold text-warn tabular-nums">{fill(t.missed, { n: week.misses })}</strong>
      {week.breakdown.map((b) => (
        <span key={b.key} className="flex items-center gap-1.5 text-muted">
          <span aria-hidden className="size-2 rounded-[2px]" style={{ background: contentColor(b.key) }} />
          {b.name} <span className="tabular-nums text-foreground">{b.missed}</span>
        </span>
      ))}
    </div>
  );
}

function WarnedCard({
  member,
  kickAfter,
  locale,
  t,
  kick,
}: {
  member: WarnedMember;
  kickAfter: number;
  locale: "th" | "en";
  t: T;
  kick?: boolean;
}) {
  return (
    <li className={`rounded-lg border bg-surface ${kick ? "border-miss" : "border-border"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="flex items-baseline gap-3">
          <MemberLink id={member.memberId} ign={member.ign} />
          <span className={`text-sm tabular-nums ${kick ? "font-semibold text-miss" : "text-muted"}`}>
            {fill(t.count, { n: member.warnings.length, k: kickAfter })}
          </span>
        </span>
        {kick && (
          <ActionButton
            action={kickMember.bind(null, member.memberId)}
            confirm={fill(t.kickConfirm, { name: member.ign })}
            className={secondaryButton}
          >
            {t.kicked}
          </ActionButton>
        )}
      </div>
      <ul className="divide-y divide-border">
        {member.warnings.map((w) => (
          <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
            <Week week={w} locale={locale} t={t} />
            <ActionButton
              action={clearWarning.bind(null, w.id)}
              confirm={fill(t.clearConfirm, { name: member.ign })}
              className={quietButton}
            >
              {t.clear}
            </ActionButton>
          </li>
        ))}
      </ul>
    </li>
  );
}
