import apiClient from "@/services/apiClient";
import type { Board, BoardDetail, BoardRef, Column } from "./types";

const boardsUrl = (orgId: string, projectId: string) =>
  `/organizations/${orgId}/projects/${projectId}/boards`;

export function getBoards(orgId: string, projectId: string) {
  return apiClient.get<Board[]>(boardsUrl(orgId, projectId));
}

export function createBoard(
  orgId: string,
  projectId: string,
  input: { name: string },
) {
  return apiClient.post<Board>(boardsUrl(orgId, projectId), input);
}

export function getBoard({ orgId, projectId, boardId }: BoardRef) {
  return apiClient.get<BoardDetail>(
    `${boardsUrl(orgId, projectId)}/${boardId}`,
  );
}

export function createColumn(
  { orgId, projectId, boardId }: BoardRef,
  input: { name: string },
) {
  return apiClient.post<Column>(
    `${boardsUrl(orgId, projectId)}/${boardId}/columns`,
    input,
  );
}
