import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { getOfficer } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const officer = await getOfficer();
  if (!officer) redirect("/login");

  const { t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4">
          <AdminNav
            items={[
              { href: "/admin/week", label: t.admin.navWeek },
              { href: "/admin/members", label: t.admin.navMembers },
            ]}
          />
          <div className="flex items-center gap-3 py-2 text-sm text-muted">
            <span>
              {t.admin.signedInAs} <strong className="text-foreground">{officer.username}</strong>
            </span>
            <form action={logout}>
              <button className="rounded px-2 py-1 underline hover:text-foreground">
                {t.admin.signOut}
              </button>
            </form>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
