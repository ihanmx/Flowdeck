"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { isAxiosError } from "axios";

interface UseApiQueryProps<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  options?: Omit<
    UseQueryOptions<T, Error, T, readonly unknown[]>,
    "queryKey" | "queryFn"
  >;
}

export function useApiQuery<T>({
  queryKey,
  queryFn,
  options,
}: UseApiQueryProps<T>) {
  return useQuery<T, Error>({
    queryKey,
    queryFn,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status && status >= 400 && status < 500) return false; // 4xx = don't retry
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    ...options,
  });
}
