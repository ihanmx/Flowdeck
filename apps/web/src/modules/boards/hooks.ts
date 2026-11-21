import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { getBoards, createBoard, getBoard, createColumn } from "./api";
import type { BoardRef } from "./types";

export const boardKeys = {
  all: (orgId: string, projectId: string) =>
    ["organizations", orgId, "projects", projectId, "boards"] as const,
  detail: ({ orgId, projectId, boardId }: BoardRef) =>
    ["organizations", orgId, "projects", projectId, "boards", boardId] as const,
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
export function useBoard(ref: BoardRef) {
  return useApiQuery({
    queryKey: boardKeys.detail(ref),
    queryFn: () => getBoard(ref),
    options: { enabled: !!ref.orgId && !!ref.projectId && !!ref.boardId },
  });
}

export function useCreateColumn(ref: BoardRef) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (input: { name: string }) => createColumn(ref, input),
    options: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(ref) }),
    },
  });
}
