import { AuthGuard } from "@/shared/guards/AuthGuard";
import { Sidebar } from "@/shared/components/organisms/Sidebar";
import { Topbar } from "@/shared/components/organisms/Topbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-canvas">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
