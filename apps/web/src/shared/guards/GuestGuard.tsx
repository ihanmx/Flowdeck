"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && token) router.replace("/dashboard");
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return null; // wait
  if (token) return null; // redirecting
  return <>{children}</>;
}
