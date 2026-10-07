import Link from "next/link";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/i18n";
import { toggleLocale } from "@/lib/i18n/actions";

// The score bug: the app name on a gold plate, an optional tag plate beside it.
function ScoreBug({ name, tag }: { name: string; tag?: ReactNode }) {
  return (
    <Link href="/" className="flex items-stretch">
      <span className="bug-lead headline flex items-center bg-live py-1 pr-[1.1rem] pl-3.5 text-[1.1rem] text-live-fg uppercase">
        {name}
      </span>
      {tag && (
        <span className="bug-tail -ml-1.5 flex items-center bg-surface-2 py-1 pr-[1.1rem] pl-4 text-sm whitespace-nowrap text-foreground">
          {tag}
        </span>
      )}
    </Link>
  );
}

// One-row header. Officer pages pass `nav` + `account`; public pages pass a
// `banner` (title block) and an optional `tag` (the week) for the score bug.
export async function SiteHeader({
  nav,
  account,
  banner,
  tag,
  width = "max-w-6xl",
}: {
  nav?: ReactNode;
  account?: ReactNode;
  banner?: ReactNode;
  tag?: ReactNode;
  width?: string;
}) {
  const { t } = await getDictionary();

  const languageSwitch = (
    <form action={toggleLocale}>
      <button
        className="rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
        lang={t.switchLanguage === "English" ? "en" : "th"}
      >
        {t.switchLanguage}
      </button>
    </form>
  );

  if (banner) {
    return (
      <header className="border-b border-border">
        <div className={`mx-auto w-full ${width} px-4`}>
          <div className="flex items-center justify-between gap-3 pt-3.5">
            <ScoreBug name={t.appName} tag={tag} />
            {languageSwitch}
          </div>
          <div className="pt-5 pb-6">{banner}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className={`mx-auto flex w-full ${width} flex-wrap items-stretch gap-x-8 px-4`}>
        <div className="flex items-center py-3">
          <ScoreBug name={t.appName} />
        </div>
        {nav && (
          <div className="order-last -mx-4 flex w-[calc(100%+2rem)] border-t border-border px-2 sm:order-none sm:mx-0 sm:w-auto sm:border-t-0 sm:px-0">
            {nav}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 py-2">
          {languageSwitch}
          {account}
        </div>
      </div>
    </header>
  );
}
