import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { boardKeys } from "@/modules/boards/hooks";
import type { BoardRef } from "@/modules/boards/types";
import { createTask, moveTask, type CreateTaskInput } from "./api";
import { moveTaskInBoard } from "@/modules/boards/utils";
import type { BoardDetail } from "@/modules/boards/types";

interface MoveTaskVars {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
}

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

export function useMoveTask(ref: BoardRef) {
  const queryClient = useQueryClient();
  const key = boardKeys.detail(ref);

  return useApiMutation({
    mutationFn: ({ taskId, fromColumnId, toColumnId, toIndex }: MoveTaskVars) =>
      moveTask(ref, fromColumnId, taskId, {
        targetColumnId: toColumnId,
        targetPosition: toIndex,
      }),
    options: {
      onMutate: async ({ taskId, toColumnId, toIndex }) => {
        // 1. stop any in-flight board refetch from overwriting our optimistic state
        await queryClient.cancelQueries({ queryKey: key });
        // 2. snapshot for rollback
        const previous = queryClient.getQueryData<BoardDetail>(key);
        // 3. move the card in the cache NOW
        if (previous) {
          queryClient.setQueryData<BoardDetail>(
            key,
            moveTaskInBoard(previous, taskId, toColumnId, toIndex),
          );
        }
        return { previous }; // becomes `context` in onError
      },
      onError: (_error, _vars, context) => {
        // server said no → put the board back exactly as it was
        if (context?.previous) queryClient.setQueryData(key, context.previous);
      },
      onSettled: () => {
        // success or failure: re-sync with the server's truth
        queryClient.invalidateQueries({ queryKey: key });
      },
    },
  });
}
