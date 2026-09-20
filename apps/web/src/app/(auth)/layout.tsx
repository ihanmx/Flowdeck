import { GuestGuard } from "@/shared/guards/GuestGuard";
import { AuthLayout } from "@/shared/layouts/AuthLayout";

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
