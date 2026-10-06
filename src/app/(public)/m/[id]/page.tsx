import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Notice, fill, verdict } from "@/components/notice";
import { Seals } from "@/components/seals";
import { SiteHeader } from "@/components/site-header";
import { loadMember } from "@/lib/board";
import { getDictionary } from "@/lib/i18n";
import { formatWeek } from "@/lib/week";

export async function generateMetadata({ params }: PageProps<"/m/[id]">): Promise<Metadata> {
  const { locale } = await getDictionary();
  const { member } = await loadMember(locale, Number((await params).id));
  return { title: member?.ign ?? "Jugyeom" };
}

export default async function MemberPage({ params, searchParams }: PageProps<"/m/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const w = (await searchParams).w;

  const { locale, t } = await getDictionary();
  const tb = t.board;
  const { member, weeks, threshold } = await loadMember(locale, id);
  if (!member) notFound();

  const selected = weeks.find((wk) => wk.weekStart === w) ?? weeks[0] ?? null;
  const role = member.left_at ? tb.former : tb.roles[member.role as "leader" | "officer" | "member"];

  return (
    <>
      <SiteHeader
        width="max-w-5xl"
        banner={
          <div className="pb-1">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-banner-fg/80 hover:text-banner-fg">
              <ArrowLeft className="size-4" aria-hidden />
              {tb.backToBoard}
            </Link>
            <p className="mt-1 text-banner-fg/80">
              {selected ? fill(tb.week, formatWeek(selected.weekStart, locale)) : role}
            </p>
          </div>
        }
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-3 pb-16">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <Notice
                as="h1"
                name={member.ign}
                role={role}
                missed={selected.missed}
                threshold={threshold}
                contents={selected.contents}
                t={tb}
              />
            ) : (
              <section className="relative rounded-[5px] bg-surface px-5 pt-7 pb-5">
                <span aria-hidden className="pin absolute -top-[7px] left-1/2 size-[14px] -translate-x-1/2" />
                <h1 className="font-display text-[1.6rem] font-bold">{member.ign}</h1>
                <p className="mt-2 text-muted">{tb.noHistory}</p>
              </section>
            )}
          </div>

          {weeks.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-bold">{tb.history}</h2>
              <ol className="flex flex-col gap-2">
                {weeks.map((wk) => {
                  const v = verdict(wk.missed, threshold, tb);
                  const active = wk.weekStart === selected?.weekStart;
                  const label = formatWeek(wk.weekStart, locale);
                  return (
                    <li key={wk.weekStart}>
                      <Link
                        href={`/m/${member.id}?w=${wk.weekStart}`}
                        aria-current={active ? "page" : undefined}
                        className={`grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 rounded-[4px] px-3 py-3 transition-colors ${
                          active ? "bg-surface-2 outline-2 outline-offset-2 outline-brass" : "bg-surface hover:bg-surface-2"
                        } ${wk.missed >= threshold ? "ring-2 ring-seal" : ""}`}
                      >
                        <span className="text-sm">
                          {label.start} – {label.end}
                        </span>
                        <span className="flex min-w-0 flex-col gap-1">
                          <Seals total={threshold} missed={wk.missed} size={12} label={fill(tb.missedOf, { n: wk.missed, limit: threshold })} />
                          <span className={`truncate text-xs ${v.tone === "warn" ? "font-semibold text-seal" : v.tone === "ok" ? "text-ok" : "text-muted"}`}>
                            {v.tone === "mid" ? fill(tb.missedOf, { n: wk.missed, limit: threshold }) : v.text}
                          </span>
                        </span>
                        <span className={`text-right text-sm ${wk.missed >= threshold ? "font-semibold text-seal" : "text-muted"}`}>
                          {wk.missed}/{threshold}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
