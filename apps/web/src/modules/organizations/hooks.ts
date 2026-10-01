import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { getMyOrganizations, createOrganization, getOrgMembers } from "./api";

// Central place for this module's cache keys — so reads & invalidations always match.
export const orgKeys = {
  all: ["organizations"] as const,
  members: (orgId: string) => ["organizations", orgId, "members"] as const,
};

export function useOrganizations() {
  return useApiQuery({
    queryKey: orgKeys.all,
    queryFn: getMyOrganizations,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: createOrganization,
    options: {
      // After creating, refetch the org list so the new one appears everywhere.
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.all }),
    },
  });
}

export function useOrgMembers(orgId: string) {
  return useApiQuery({
    queryKey: orgKeys.members(orgId),
    queryFn: () => getOrgMembers(orgId),
    options: { enabled: !!orgId }, // don't run until we have an org id
  });
}
