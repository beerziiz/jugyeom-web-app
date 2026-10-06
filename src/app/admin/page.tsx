import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { createClient, getOfficer } from "@/lib/supabase/server";
import { logout } from "../login/actions";

export default async function AdminPage() {
  const officer = await getOfficer();
  if (!officer) redirect("/login");

  const { t } = await getDictionary();
  const supabase = await createClient();
  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .is("left_at", null);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t.admin.title}</h1>
        <form action={logout}>
          <button className="text-sm underline">{t.admin.signOut}</button>
        </form>
      </div>
      <p className="mb-2">
        {t.admin.signedInAs} <strong>{officer.username}</strong> ({officer.role})
      </p>
      <p className="mb-6">
        {t.admin.members}: <strong>{count ?? 0}</strong>
      </p>
      <p className="text-sm opacity-70">{t.admin.next}</p>
    </main>
  );
}
