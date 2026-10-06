import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { getOfficer } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getOfficer()) redirect("/admin");
  const { t } = await getDictionary();

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">{t.login.title}</h1>
      <LoginForm t={t.login} />
    </main>
  );
}
