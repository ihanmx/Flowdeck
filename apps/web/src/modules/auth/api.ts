import apiClient from "@/services/apiClient";
import type { AuthUser } from "../../stores/auth.store";

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export function loginApi(data: LoginInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", data);
}

export function registerApi(input: RegisterInput) {
  return apiClient.post<AuthResponse>("/auth/register", input);
}
export function logoutApi() {
  return apiClient.post<void>("/auth/logout");
}
