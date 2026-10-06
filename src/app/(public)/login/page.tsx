import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n";
import { getOfficer } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getOfficer()) redirect("/admin");
  const { t } = await getDictionary();

  return (
    <>
      <SiteHeader
        width="max-w-sm"
        banner={<h1 className="pb-1 font-display text-2xl font-bold">{t.login.title}</h1>}
      />
      <main className="mx-auto w-full max-w-sm px-4 py-8">
        <LoginForm t={t.login} />
      </main>
    </>
  );
}
