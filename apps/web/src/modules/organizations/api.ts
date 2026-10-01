import apiClient from "@/services/apiClient";
import type { Organization, OrgMember } from "./types";

export function getMyOrganizations() {
  return apiClient.get<Organization[]>("/organizations");
}

export function createOrganization(input: { name: string }) {
  return apiClient.post<Organization>("/organizations", input);
}

export function getOrgMembers(orgId: string) {
  return apiClient.get<OrgMember[]>(`/organizations/${orgId}/members`);
}
