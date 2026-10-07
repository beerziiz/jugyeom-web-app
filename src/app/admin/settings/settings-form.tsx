"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { field, primaryButton } from "@/lib/ui";
import { updateSettings, type SettingsState } from "./actions";

export function SettingsForm({
  missThreshold,
  kickAfter,
  t,
}: {
  missThreshold: number;
  kickAfter: number;
  t: Dictionary["settings"];
}) {
  const [state, action, saving] = useActionState<SettingsState, FormData>(updateSettings, {});
  const [values, setValues] = useState({ miss: String(missThreshold), kick: String(kickAfter) });
  const dirty = values.miss !== String(missThreshold) || values.kick !== String(kickAfter);

  return (
    <form action={action} className="flex max-w-xl flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">{t.missThreshold}</span>
        <span className="text-sm text-muted">{t.missThresholdHint}</span>
        <input
          name="miss_threshold"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          required
          value={values.miss}
          onChange={(e) => setValues((v) => ({ ...v, miss: e.target.value }))}
          className={`${field} w-28 tabular-nums`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">{t.kickAfter}</span>
        <span className="text-sm text-muted">{t.kickAfterHint}</span>
        <input
          name="kick_after_warnings"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          required
          value={values.kick}
          onChange={(e) => setValues((v) => ({ ...v, kick: e.target.value }))}
          className={`${field} w-28 tabular-nums`}
        />
      </label>
      <div className="flex items-center gap-4 border-t border-border pt-4">
        <button disabled={saving || !dirty} className={primaryButton}>
          {saving ? t.saving : t.save}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {state.ok && !dirty && <span className="text-ok">{t.saved}</span>}
          {state.error && <span className="text-danger">{state.error === "invalid" ? t.invalid : t.failed}</span>}
        </p>
      </div>
    </form>
  );
}
