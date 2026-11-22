import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { orgKeys } from "@/modules/organizations/hooks";
import { getInvitations, createInvitation, acceptInvitation } from "./api";
import type { InviteRole } from "./types";

export const invitationKeys = {
  all: (orgId: string) => ["organizations", orgId, "invitations"] as const,
};

export function useInvitations(orgId: string, canManage: boolean) {
  return useApiQuery({
    queryKey: invitationKeys.all(orgId),
    queryFn: () => getInvitations(orgId),
    options: { enabled: !!orgId && canManage }, // members would get 403 → don't ask
  });
}

export function useCreateInvitation(orgId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: { email: string; role: InviteRole }) =>
      createInvitation(orgId, input),
    options: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: invitationKeys.all(orgId) }),
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: acceptInvitation,
    options: {
      // you joined a new org → refresh your org list
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.all }),
    },
  });
}
