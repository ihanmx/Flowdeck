export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold text-ink">
            Flowdeck
          </span>
          <p className="mt-1 text-sm text-muted">
            Where teams move work forward.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
