import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { boardKeys } from "@/modules/boards/hooks";
import type { BoardRef } from "@/modules/boards/types";
import { createTask, type CreateTaskInput } from "./api";

// create a task then refresh the board
export function useCreateTask(ref: BoardRef) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({
      columnId,
      ...input
    }: CreateTaskInput & { columnId: string }) =>
      createTask(ref, columnId, input),
    options: {
      // Tasks live inside the board's cache entry → refresh the board
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(ref) }),
    },
  });
}
