/** Square letter badge for an organization (first letter of its name). */
export function OrgAvatar({ name }: { name: string }) {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary-500 text-xs font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
