"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/modules/auth/hooks";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="grid h-9 w-9 place-items-center rounded-full bg-primary-500 text-sm font-semibold text-white"
      >
        {initials}
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <button
            aria-hidden
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-20 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-ink">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-canvas transition"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
