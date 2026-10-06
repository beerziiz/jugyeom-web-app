"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { field, primaryButton } from "@/lib/ui";

export function LoginForm({ t }: { t: Dictionary["login"] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">{t.username}</span>
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">{t.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {t[state.error]}
        </p>
      )}
      <button disabled={pending} className={`${primaryButton} py-2.5`}>
        {t.submit}
      </button>
    </form>
  );
}
