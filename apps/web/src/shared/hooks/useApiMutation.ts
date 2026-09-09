"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface ApiError {
  message: string;
}

interface UseApiMutationProps<TPayload, TResponse> {
  mutationFn: (payload: TPayload) => Promise<TResponse>;
  options?: Omit<
    UseMutationOptions<TResponse, AxiosError<ApiError>, TPayload>,
    "mutationFn"
  >;
}

export function useApiMutation<TPayload, TResponse>({
  mutationFn,
  options,
}: UseApiMutationProps<TPayload, TResponse>) {
  return useMutation<TResponse, AxiosError<ApiError>, TPayload>({
    mutationFn,
    ...options,
  });
}
