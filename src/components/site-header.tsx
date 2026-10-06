import Link from "next/link";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/i18n";
import { toggleLocale } from "@/lib/i18n/actions";

// One-row header. Officer pages pass `nav` + `account`; public pages pass a
// `banner` (title block) and get the guild pennant.
export async function SiteHeader({
  nav,
  account,
  banner,
  width = "max-w-6xl",
}: {
  nav?: ReactNode;
  account?: ReactNode;
  banner?: ReactNode;
  width?: string;
}) {
  const { t } = await getDictionary();

  const languageSwitch = (
    <form action={toggleLocale}>
      <button
        className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
          banner
            ? "text-banner-fg/80 hover:bg-banner-fg/10 hover:text-banner-fg"
            : "text-muted hover:bg-surface-2 hover:text-foreground"
        }`}
        lang={t.switchLanguage === "English" ? "en" : "th"}
      >
        {t.switchLanguage}
      </button>
    </form>
  );

  if (banner) {
    return (
      <header className="pennant bg-banner pb-[calc(var(--notch)+0.75rem)] text-banner-fg">
        <div className={`mx-auto w-full ${width} px-4`}>
          <div className="flex items-center justify-between py-2.5">
            <Link href="/" className="font-display text-base font-bold text-banner-fg/85 hover:text-banner-fg">
              {t.appName}
            </Link>
            {languageSwitch}
          </div>
          {banner}
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className={`mx-auto flex w-full ${width} flex-wrap items-stretch gap-x-8 px-4`}>
        <Link href="/" className="flex items-center py-3.5 font-display text-lg font-bold">
          {t.appName}
        </Link>
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
