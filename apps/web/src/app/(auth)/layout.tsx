import { GuestGuard } from "@/shared/guards/GuestGuard";
import { Logo } from "@/shared/components/atoms/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="min-h-screen grid place-items-center bg-canvas px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </div>
    </GuestGuard>
  );
}
