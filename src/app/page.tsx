import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function OverviewPage() {
  const { t } = await getDictionary();
  const supabase = await createClient();

  const [{ data: members }, { data: latest }] = await Promise.all([
    supabase.from("members").select("id, ign").is("left_at", null).order("ign"),
    supabase
      .from("periods")
      .select("id, week_start")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: misses } = latest
    ? await supabase
        .from("weekly_misses")
        .select("member_id, misses, over_threshold")
        .eq("period_id", latest.id)
    : { data: [] };

  const byMember = new Map(misses?.map((m) => [m.member_id, m]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{t.overview.title}</h1>
      <p className="mb-6 text-sm opacity-70">
        {latest ? `${t.overview.thisWeek}: ${latest.week_start}` : t.overview.noWeek}
      </p>

      {!members?.length ? (
        <p>{t.overview.noMembers}</p>
      ) : (
        <table className="w-full text-left">
          <thead className="text-sm opacity-70">
            <tr>
              <th className="py-2 font-medium">{t.overview.member}</th>
              <th className="py-2 text-right font-medium">{t.overview.misses}</th>
              <th className="py-2 text-right font-medium">{t.overview.status}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const row = byMember.get(m.id);
              return (
                <tr key={m.id} className="border-t border-current/10">
                  <td className="py-2">{m.ign}</td>
                  <td className="py-2 text-right tabular-nums">{row?.misses ?? 0}</td>
                  <td className="py-2 text-right">
                    {row?.over_threshold ? t.overview.warning : t.overview.ok}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
