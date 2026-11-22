"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface ApiError {
  message: string;
}

interface UseApiMutationProps<TPayload, TResponse, TContext = unknown> {
  mutationFn: (payload: TPayload) => Promise<TResponse>;
  options?: Omit<
    UseMutationOptions<TResponse, AxiosError<ApiError>, TPayload, TContext>,
    "mutationFn"
  >;
}

export function useApiMutation<TPayload, TResponse, TContext = unknown>({
  mutationFn,
  options,
}: UseApiMutationProps<TPayload, TResponse, TContext>) {
  return useMutation<TResponse, AxiosError<ApiError>, TPayload, TContext>({
    mutationFn,
    ...options,
  });
}
