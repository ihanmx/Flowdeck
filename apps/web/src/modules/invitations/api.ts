import apiClient from "@/services/apiClient";
import type { Invitation, InviteRole } from "./types";

export function getInvitations(orgId: string) {
  return apiClient.get<Invitation[]>(`/organizations/${orgId}/invitations`);
}

export function createInvitation(
  orgId: string,
  input: { email: string; role: InviteRole },
) {
  return apiClient.post<Invitation>(
    `/organizations/${orgId}/invitations`,
    input,
  );
}

export function acceptInvitation(token: string) {
  return apiClient.post<{ organizationId: string }>("/invitations/accept", {
    token,
  });
}
