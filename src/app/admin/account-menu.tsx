"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { logout } from "../(public)/login/actions";

export function AccountMenu({
  username,
  roleLabel,
  signOutLabel,
}: {
  username: string;
  roleLabel: string;
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md py-1.5 pr-2 pl-1.5 text-sm transition-colors hover:bg-surface-2"
      >
        <span
          aria-hidden
          className="grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-fg uppercase"
        >
          {username.slice(0, 1)}
        </span>
        <span className="hidden font-medium sm:inline">{username}</span>
        <ChevronDown className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-[0_8px_24px_-6px_rgb(0_0_0/0.25)]"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{username}</p>
            <p className="text-xs text-muted">{roleLabel}</p>
          </div>
          <form action={logout}>
            <button
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
            >
              <LogOut className="size-4 text-muted" aria-hidden />
              {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
