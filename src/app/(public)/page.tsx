import Link from "next/link";
import { MiniNotice, Notice, fill } from "@/components/notice";
import { SiteHeader } from "@/components/site-header";
import { loadBoard } from "@/lib/board";
import { getDictionary } from "@/lib/i18n";
import { getMe } from "@/lib/me";
import { formatWeek } from "@/lib/week";
import { clearMe, setMe } from "./me-actions";

export default async function BoardPage({ searchParams }: PageProps<"/">) {
  const w = (await searchParams).w;
  const { locale, t } = await getDictionary();
  const [board, meId] = await Promise.all([
    loadBoard(locale, typeof w === "string" ? w : undefined),
    getMe(),
  ]);
  const tb = t.board;
  const { period, members, threshold, periods } = board;
  const week = period ? formatWeek(period.week_start, locale) : null;

  const me = members.find((m) => m.id === meId) ?? null;
  const warned = members.filter((m) => m.missed >= threshold).sort((a, b) => b.missed - a.missed);
  const rest = members.filter((m) => m.missed < threshold).sort((a, b) => b.missed - a.missed || a.ign.localeCompare(b.ign));
  const weekQuery = period && period.week_start !== periods[0]?.week_start ? `?w=${period.week_start}` : "";
  const scrubber = [...periods].slice(0, 8).reverse();

  return (
    <>
      <SiteHeader
        width="max-w-5xl"
        tag={week ? fill(tb.week, week) : undefined}
        banner={<h1 className="headline text-[clamp(2rem,6vw,3.2rem)] leading-[1.05]">{tb.title}</h1>}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-7 pb-16">
        {!period ? (
          <p className="mx-auto max-w-md py-16 text-center text-muted">{tb.noWeek}</p>
        ) : (
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
            <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
              {me ? (
                <Notice
                  name={me.ign}
                  role={tb.roles[me.role]}
                  missed={me.missed}
                  threshold={threshold}
                  contents={me.contents}
                  t={tb}
                  footer={
                    <form action={clearMe} className="flex justify-end">
                      <button className="text-muted underline hover:text-foreground">{tb.notMe}</button>
                    </form>
                  }
                />
              ) : (
                <section className="rounded-[4px] bg-surface px-5 pt-5 pb-5">
                  <h2 className="headline text-[2rem] leading-tight">{tb.whoAreYou}</h2>
                  <p className="mt-1 text-sm text-muted">{tb.whoHint}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[...members]
                      .sort((a, b) => a.ign.localeCompare(b.ign))
                      .map((m) => (
                        <form key={m.id} action={setMe}>
                          <input type="hidden" name="id" value={m.id} />
                          <button className="slant min-h-11 bg-surface-2 px-5 text-sm transition-colors hover:bg-live hover:text-live-fg">
                            {m.ign}
                          </button>
                        </form>
                      ))}
                  </div>
                </section>
              )}

              {scrubber.length > 1 && (
                <nav aria-label={tb.weeks} className="flex gap-1.5 overflow-x-auto pb-1">
                  {scrubber.map((p) => {
                    const active = p.id === period.id;
                    const latest = p.week_start === periods[0].week_start;
                    return (
                      <Link
                        key={p.id}
                        href={latest ? "/" : `/?w=${p.week_start}`}
                        aria-current={active ? "page" : undefined}
                        className={`slant flex min-h-11 min-w-18 flex-1 items-center justify-center px-2 text-center text-xs whitespace-nowrap transition-colors ${
                          active
                            ? "bg-live font-semibold text-live-fg"
                            : "bg-surface text-muted hover:bg-surface-2 hover:text-foreground"
                        }`}
                      >
                        {formatWeek(p.week_start, locale).short}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            <div className="flex flex-col gap-8">
              <section>
                <h2 className="mb-3 flex items-baseline gap-2 headline text-[1.35rem]">
                  {tb.warned}
                  <span className={`font-sans text-base font-normal not-italic ${warned.length ? "text-miss" : "text-muted"}`}>{warned.length}</span>
                </h2>
                {warned.length ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {warned.map((m) => (
                      <MiniNotice
                        key={m.id}
                        href={`/m/${m.id}${weekQuery}`}
                        name={m.ign}
                        missed={m.missed}
                        threshold={threshold}
                        t={tb}
                        highlight={m.id === meId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-ok">{tb.noneWarned}</p>
                )}
              </section>

              <section>
                <h2 className="mb-3 flex items-baseline gap-2 headline text-[1.35rem]">
                  {tb.everyone}
                  <span className="font-sans text-base font-normal not-italic text-muted">{rest.length}</span>
                </h2>
                {rest.length ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {rest.map((m) => (
                      <MiniNotice
                        key={m.id}
                        href={`/m/${m.id}${weekQuery}`}
                        name={m.ign}
                        missed={m.missed}
                        threshold={threshold}
                        t={tb}
                        highlight={m.id === meId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">{tb.noMembers}</p>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
