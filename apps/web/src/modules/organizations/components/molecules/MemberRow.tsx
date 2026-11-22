import type { OrgMember } from "../../types";

export function MemberRow({ member }: { member: OrgMember }) {
  const label = member.user.name ?? member.user.email;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-500 text-xs font-semibold text-white">
        {label.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        <p className="truncate text-xs text-muted">{member.user.email}</p>
      </div>
      <span className="rounded-md bg-canvas px-2 py-0.5 text-xs font-medium text-body">
        {member.role.toLowerCase()}
      </span>
    </li>
  );
}
