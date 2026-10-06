"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm({ t }: { t: Dictionary["login"] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm">{t.username}</span>
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="rounded border border-current/20 bg-transparent px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm">{t.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-current/20 bg-transparent px-3 py-2"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {t[state.error]}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded bg-foreground px-3 py-2 text-background disabled:opacity-50"
      >
        {t.submit}
      </button>
    </form>
  );
}
