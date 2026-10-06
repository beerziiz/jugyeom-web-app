"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { addMembers, type ActionState } from "./actions";
import { field, primaryButton } from "@/lib/ui";

export function AddMembersForm({ t }: { t: Dictionary["members"] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addMembers, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <h2 className="text-lg font-semibold">{t.add}</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted">{t.ign}</span>
          <textarea name="names" rows={3} required className={`${field} resize-y`} />
          <span className="text-xs text-muted">{t.addHint}</span>
        </label>
        <label className="flex flex-col gap-1 sm:w-40">
          <span className="text-sm text-muted">{t.role}</span>
          <select name="role" defaultValue="member" className={field}>
            <option value="member">{t.roles.member}</option>
            <option value="officer">{t.roles.officer}</option>
            <option value="leader">{t.roles.leader}</option>
          </select>
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending} className={primaryButton}>
          {t.add}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {state.error === "duplicate" && <span className="text-danger">{t.duplicate}</span>}
          {state.error === "failed" && <span className="text-danger">{t.failed}</span>}
          {state.ok && !pending ? <span className="text-ok">{t.saved}</span> : null}
        </p>
      </div>
    </form>
  );
}
