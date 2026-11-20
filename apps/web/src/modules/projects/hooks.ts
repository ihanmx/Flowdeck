import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { getProjects, createProject } from "./api";
import type { CreateProjectInput } from "./types";
import { input } from "zod";

export const projectKeys = {
  all: (orgId: string) => ["organizations", orgId, "projects"] as const,
};

export function useProjects(orgId: string) {
  return useApiQuery({
    queryKey: projectKeys.all(orgId),
    queryFn: () => getProjects(orgId),
    options: { enabled: !!orgId }, // wait until an org is active
  });
}

export function useCreateProject(orgId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: CreateProjectInput) => createProject(orgId, input),
    options: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: projectKeys.all(orgId) }),
    },
  });
}
