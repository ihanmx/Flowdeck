import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { getBoards, createBoard } from "./api";

export const boardKeys = {
  all: (orgId: string, projectId: string) =>
    ["organizations", orgId, "projects", projectId, "boards"] as const,
};

export function useBoards(orgId: string, projectId: string) {
  return useApiQuery({
    queryKey: boardKeys.all(orgId, projectId),
    queryFn: () => getBoards(orgId, projectId),
    options: { enabled: !!orgId && !!projectId },
  });
}

export function useCreateBoard(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: { name: string }) =>
      createBoard(orgId, projectId, input),
    options: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: boardKeys.all(orgId, projectId),
        }),
    },
  });
}
