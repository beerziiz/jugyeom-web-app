import Link from "next/link";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/i18n";
import { toggleLocale } from "@/lib/i18n/actions";

// One-row header. `nav` sits beside the logo on desktop and wraps to its own
// row on phones; `account` sits at the far right next to the language switch.
export async function SiteHeader({
  nav,
  account,
  width = "max-w-6xl",
}: {
  nav?: ReactNode;
  account?: ReactNode;
  width?: string;
}) {
  const { t } = await getDictionary();

  return (
    <header className="border-b border-border bg-surface">
      <div className={`mx-auto flex w-full ${width} flex-wrap items-stretch gap-x-8 px-4`}>
        <Link href="/" className="flex items-center py-3.5 text-base font-semibold tracking-tight">
          {t.appName}
        </Link>
        {nav && <div className="order-last -mx-4 w-[calc(100%+2rem)] flex border-t border-border px-2 sm:order-none sm:mx-0 sm:w-auto sm:border-t-0 sm:px-0">{nav}</div>}
        <div className="ml-auto flex items-center gap-1 py-2">
          <form action={toggleLocale}>
            <button
              className="rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              lang={t.switchLanguage === "English" ? "en" : "th"}
            >
              {t.switchLanguage}
            </button>
          </form>
          {account}
        </div>
      </div>
    </header>
  );
}
