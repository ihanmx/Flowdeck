export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string; // membership id
  role: Role;
  createdAt: string;
  user: { id: string; email: string; name: string | null };
}
