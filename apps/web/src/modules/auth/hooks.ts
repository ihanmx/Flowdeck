import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  loginApi,
  registerApi,
  logoutApi,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";
import { useOrgStore } from "@/stores/org.store";
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  return useApiMutation<LoginInput, AuthResponse>({
    mutationFn: loginApi,
    options: {
      onSuccess: (data) => {
        setAuth(data);
        router.push("/dashboard");
      },
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  return useApiMutation<RegisterInput, AuthResponse>({
    mutationFn: registerApi,
    options: {
      onSuccess: (data) => {
        setAuth(data);
        router.push("/dashboard");
      },
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  return useApiMutation<void, void>({
    mutationFn: logoutApi,
    options: {
      onSettled: () => {
        clearAuth();
        useOrgStore.getState().setActiveOrg(null);

        queryClient.clear(); // wipe ALL cached server data
        router.push("/login");
      },
    },
  });
}
