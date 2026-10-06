"use client";

import { useActionState, useState, useTransition } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { setMemberLeft, updateMember, type ActionState, type MemberRole } from "./actions";
import { field, quietButton, secondaryButton } from "@/lib/ui";

export type Member = {
  id: number;
  ign: string;
  role: MemberRole;
  joined_at: string;
  left_at: string | null;
};

export function MemberRow({ member, t }: { member: Member; t: Dictionary["members"] }) {
  const [state, action, saving] = useActionState<ActionState, FormData>(updateMember, {});
  const [ign, setIgn] = useState(member.ign);
  const [role, setRole] = useState(member.role);
  const [leftError, setLeftError] = useState<ActionState["error"]>();
  const [moving, startMove] = useTransition();
  const dirty = ign.trim() !== member.ign || role !== member.role;
  const error = state.error ?? leftError;

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <form action={action} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={member.id} />
        <input
          name="ign"
          value={ign}
          onChange={(e) => setIgn(e.target.value)}
          aria-label={t.ign}
          required
          className={`${field} min-w-0 flex-1 basis-40 py-1.5`}
        />
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as MemberRole)}
          aria-label={t.role}
          className={`${field} w-32 py-1.5`}
        >
          <option value="member">{t.roles.member}</option>
          <option value="officer">{t.roles.officer}</option>
          <option value="leader">{t.roles.leader}</option>
        </select>
        {dirty && (
          <button disabled={saving} className={secondaryButton}>
            {t.save}
          </button>
        )}
        <span className="ml-auto text-xs text-muted tabular-nums">
          {member.left_at ? `${t.left} ${member.left_at}` : `${t.joined} ${member.joined_at}`}
        </span>
        <button
          type="button"
          disabled={moving}
          onClick={() =>
            startMove(async () => {
              const result = await setMemberLeft(member.id, !member.left_at);
              setLeftError(result.error);
            })
          }
          className={quietButton}
        >
          {member.left_at ? t.restore : t.markLeft}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error === "duplicate" ? t.duplicate : t.failed}
        </p>
      )}
    </li>
  );
}
