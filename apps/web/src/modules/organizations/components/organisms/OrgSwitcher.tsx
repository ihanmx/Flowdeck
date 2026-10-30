"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useActiveOrganization } from "../../hooks";
import { useOrgStore } from "@/stores/org.store";
import { OrgAvatar } from "../atoms/OrgAvatar";
import { cn } from "@/lib/cn";

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const { orgs, activeOrg, isLoading } = useActiveOrganization();
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);

  if (isLoading) {
    return <div className="h-9 w-44 animate-pulse rounded-lg bg-canvas" />;
  }
  if (!activeOrg) return null; // no orgs yet → the dashboard shows CreateOrgForm

  const select = (id: string) => {
    setActiveOrg(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 max-w-52 items-center gap-2 rounded-lg border border-line px-2 text-sm text-ink hover:bg-canvas transition"
      >
        <OrgAvatar name={activeOrg.name} />
        <span className="truncate font-medium">{activeOrg.name}</span>
        <ChevronsUpDown size={14} className="ms-auto shrink-0 text-muted" />
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <button
            aria-hidden
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute start-0 z-20 mt-2 w-64 rounded-xl border border-line bg-surface p-2 shadow-lg">
            <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              Organizations
            </p>

            {orgs.map((org) => {
              const isActive = org.id === activeOrg.id;
              return (
                <button
                  key={org.id}
                  onClick={() => select(org.id)}
                  aria-current={isActive}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas transition",
                    isActive && "bg-canvas",
                  )}
                >
                  <OrgAvatar name={org.name} />
                  <span className="truncate">{org.name}</span>
                  {isActive && (
                    <Check
                      size={16}
                      className="ms-auto shrink-0 text-primary-500"
                    />
                  )}
                </button>
              );
            })}

            <div className="my-1 h-px bg-line" />
            <Link
              href="/organizations/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-body hover:bg-canvas transition"
            >
              <Plus size={16} /> New organization
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
