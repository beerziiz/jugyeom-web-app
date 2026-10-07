import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const { t } = await getDictionary();
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("miss_threshold, kick_after_warnings").maybeSingle();
  const missThreshold = data?.miss_threshold ?? 5;
  const kickAfter = data?.kick_after_warnings ?? 2;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-muted">{t.settings.hint}</p>
      </div>
      {/* Keyed on the saved values so the form resets after a save. */}
      <SettingsForm
        key={`${missThreshold}:${kickAfter}`}
        missThreshold={missThreshold}
        kickAfter={kickAfter}
        t={t.settings}
      />
    </div>
  );
}
