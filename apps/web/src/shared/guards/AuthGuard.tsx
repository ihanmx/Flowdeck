"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    // Only side effect — navigation. No setState here.
    if (hasHydrated && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasHydrated, token, router, pathname]);

  if (!hasHydrated || !token) return null; // wait for hydration / redirecting
  return <>{children}</>;
}
