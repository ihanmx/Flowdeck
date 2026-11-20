import apiClient from "@/services/apiClient";
import type { Project, CreateProjectInput } from "./types";

export function getProjects(orgId: string) {
  return apiClient.get<Project[]>(`/organizations/${orgId}/projects`);
}

export function createProject(orgId: string, input: CreateProjectInput) {
  return apiClient.post<Project>(`/organizations/${orgId}/projects`, input);
}

export function getProject(orgId: string, projectId: string) {
  return apiClient.get<Project>(
    `/organizations/${orgId}/projects/${projectId}`,
  );
}
