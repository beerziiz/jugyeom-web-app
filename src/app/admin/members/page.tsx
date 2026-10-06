import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { AddMembersForm } from "./add-members-form";
import { MemberRow, type Member } from "./member-row";

export default async function MembersPage() {
  const { t } = await getDictionary();
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("id, ign, role, joined_at, left_at")
    .order("ign");

  const members = (data ?? []) as Member[];
  const active = members.filter((m) => !m.left_at);
  const former = members.filter((m) => m.left_at);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-bold">{t.members.title}</h1>

      <AddMembersForm t={t.members} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {t.members.active} <span className="font-normal text-muted tabular-nums">({active.length})</span>
        </h2>
        {active.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {active.map((m) => (
              <MemberRow key={m.id} member={m} t={t.members} />
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t.members.empty}</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {t.members.former} <span className="font-normal text-muted tabular-nums">({former.length})</span>
        </h2>
        {former.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {former.map((m) => (
              <MemberRow key={m.id} member={m} t={t.members} />
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t.members.noFormer}</p>
        )}
      </section>
    </div>
  );
}
