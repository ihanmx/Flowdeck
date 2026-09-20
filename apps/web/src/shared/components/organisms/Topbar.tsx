"use client";
import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/shared/components/atoms/ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-line bg-surface px-4 md:px-6">
      <div className="relative max-w-md flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          placeholder="Search tasks, projects…"
          className="h-9 w-full rounded-lg border border-line bg-canvas ps-9 pe-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        />
      </div>
      <div className="ms-auto flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-body hover:bg-canvas transition"
        >
          <Bell size={18} />
        </button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
