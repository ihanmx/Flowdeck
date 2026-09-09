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
  return useApiMutation<void, void>({
    mutationFn: logoutApi,
    options: {
      onSettled: () => {
        clearAuth();
        router.push("/");
      },
    },
  });
}
