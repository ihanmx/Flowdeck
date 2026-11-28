"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { safeNext } from "@/lib/safeNext"; //he safety check from Step 1, which only allows paths inside our own site.

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && token) {
      // after login, go where the user wanted (or /dashboard)
      const next = new URLSearchParams(window.location.search).get("next"); //the part of the URL after ?.
      router.replace(safeNext(next));
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return null; // wait
  if (token) return null; // redirecting
  return <>{children}</>;
}
