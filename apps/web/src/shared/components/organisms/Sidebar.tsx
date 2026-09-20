"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/shared/components/atoms/Logo";
import { mainNav } from "@/shared/config/navigation";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Logo size="sm" />
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary-50 text-primary-600 dark:bg-surface-2 dark:text-primary-400"
                  : "text-body hover:bg-canvas",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
