"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/modules/auth/hooks";
import { Button } from "@/shared/components/ui/Button";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="text-center flex flex-col gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">
          Hi {user?.name ?? user?.email} 👋
        </h1>
        <p className="text-muted">
          Youre logged in — and this route is protected.
        </p>
        <Button
          variant="secondary"
          loading={isPending}
          onClick={() => logout()}
        >
          Log out
        </Button>
      </div>
    </main>
  );
}
