import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { getDictionary } from "@/lib/i18n";
import { toggleLocale } from "@/lib/i18n/actions";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jugyeom",
  description: "Guild performance and missed-content tracker",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getDictionary();

  return (
    <html lang={locale} className={`${plexThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
          <Link href="/" className="font-semibold">
            {t.appName}
          </Link>
          <form action={toggleLocale}>
            <button className="text-sm underline">{t.switchLanguage}</button>
          </form>
        </header>
        {children}
      </body>
    </html>
  );
}
