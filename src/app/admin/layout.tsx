import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n";
import { getOfficer } from "@/lib/supabase/server";
import { AccountMenu } from "./account-menu";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const officer = await getOfficer();
  if (!officer) redirect("/login");

  const { t } = await getDictionary();

  return (
    <>
      <SiteHeader
        nav={
          <AdminNav
            items={[
              { href: "/admin/week", label: t.admin.navWeek },
              { href: "/admin/warnings", label: t.admin.navWarnings },
              { href: "/admin/members", label: t.admin.navMembers },
            ]}
          />
        }
        account={
          <AccountMenu
            username={officer.username}
            roleLabel={t.members.roles[officer.role as "leader" | "officer"]}
            signOutLabel={t.admin.signOut}
          />
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
