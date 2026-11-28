import type { Role } from "@/modules/organizations/types";

export type InviteRole = Exclude<Role, "OWNER">; // "ADMIN" | "MEMBER" | "VIEWER"

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  expiresAt: string;
  organizationId: string;
  createdAt: string;
}

/** What GET /invitations/:token returns — enough to show the invite page. */
export interface InvitationPreview {
  email: string;
  role: Role;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  expiresAt: string;
  organization: { name: string };
}
