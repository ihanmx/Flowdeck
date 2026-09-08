"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <main className="min-h-screen p-10 flex flex-col gap-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-ink">
          Flowdeck design check
        </h1>
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-lg border border-line bg-surface p-2.5 text-ink hover:bg-primary-50 dark:hover:bg-surface-2 transition"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <p className="text-body">
        Body text on canvas. <span className="text-muted">Muted text.</span>
      </p>

      <div className="flex flex-wrap gap-3">
        {[
          "primary-400",
          "primary-500",
          "primary-600",
          "success",
          "warning",
          "danger",
          "info",
        ].map((c) => (
          <div key={c} className="flex flex-col items-center gap-1">
            <div className={`h-14 w-14 rounded-xl bg-${c}`} />
            <span className="font-mono text-xs text-muted">{c}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="font-display text-xl font-semibold text-ink">
          Surface card
        </p>
        <p className="text-muted mt-1">
          Click the button (top-right) to toggle dark / light.
        </p>
      </div>
    </main>
  );
}
