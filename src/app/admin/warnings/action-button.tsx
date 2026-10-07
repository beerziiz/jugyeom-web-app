"use client";

import { useTransition } from "react";

/** Runs a server action on click; asks first when `confirm` is given. */
export function ActionButton({
  action,
  confirm,
  className,
  children,
}: {
  action: () => Promise<void>;
  confirm?: string;
  className: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(action);
      }}
      className={className}
    >
      {children}
    </button>
  );
}
