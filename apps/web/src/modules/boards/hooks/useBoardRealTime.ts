"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/services/socket";
import type { Task } from "@/modules/tasks/types";
import { boardKeys } from "./hooks";
import type { BoardDetail, BoardRef } from "../types";
import { insertTask, moveTaskInBoard, removeTask, replaceTask } from "../utils";

/** Keeps the cached board in sync with changes other people make, live. */
export function useBoardRealtime({ orgId, projectId, boardId }: BoardRef) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId || !boardId) return;

    const socket = getSocket();
    const key = boardKeys.detail({ orgId, projectId, boardId });
    //     This builds the cache key for this board:
    // ["organizations", "org1", "projects", "p1", "boards", "b1"]

    // apply a pure change to the cached board (only if it's loaded)

    //     Every socket event needs to do the same three things:

    // read the board from the cache,
    // change it (move, insert or remove a task),
    // write the new board back to the cache.
    const update = (change: (board: BoardDetail) => BoardDetail) =>
      queryClient.setQueryData<BoardDetail>(key, (board) =>
        board ? change(board) : board,
      );

    const join = () => socket.emit("join_board", { boardId });

    const onMoved = (task: Task) =>
      update((b) => moveTaskInBoard(b, task.id, task.columnId, task.position));
    const onCreated = (task: Task) => update((b) => insertTask(b, task));
    const onDeleted = ({ id }: { id: string }) =>
      update((b) => removeTask(b, id));
    // this payload has no `assignee` → refetch instead of patching with partial data
    const onUpdated = (task: Task) => update((b) => replaceTask(b, task));

    socket.on("connect", join); // start listening

    // When the server sends one of these events, run the matching function. The names must match what the backend sends.

    socket.on("task:moved", onMoved);
    socket.on("task:created", onCreated);
    socket.on("task:deleted", onDeleted);
    socket.on("task:updated", onUpdated);

    if (socket.connected) join();
    else socket.connect(); // → "connect" fires → join()

    // clean up
    return () => {
      socket.emit("leave_board", { boardId });
      socket.off("connect", join);
      socket.off("task:moved", onMoved);
      socket.off("task:created", onCreated);
      socket.off("task:deleted", onDeleted);
      socket.off("task:updated", onUpdated);
    };
  }, [queryClient, orgId, projectId, boardId]);
}
