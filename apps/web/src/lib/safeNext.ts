/** Where to go after login. Only same-site paths are allowed. */
export function safeNext(next: string | null): string {
  // "/invite/x" ✅   "https://evil.com" ❌   "//evil.com" ❌
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}
