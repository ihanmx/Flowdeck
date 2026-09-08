import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Request: attach the access token to every call ---
//before each req
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Response: on 401, refresh once and retry (queue concurrent calls) ---

// The shape of what /auth/refresh returns
type RefreshResponse = { accessToken: string; refreshToken: string };

let isRefreshing = false;
let waiters: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const flush = (error: unknown, token: string | null) => {
  waiters.forEach((w) =>
    error ? w.reject(error) : w.resolve(token as string),
  );
  waiters = [];
};

//before each res
api.interceptors.response.use(
  (res) => res, //successful response → just return it
  async (error: AxiosError) => {
    //err case
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined; //retry ane mark it
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes("/auth/"); // don't refresh login/refresh itself

    if (status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }

    // A refresh is already happening → wait for it, then retry this request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw new Error("No refresh token");

      // Use bare axios (not `api`) so this call isn't intercepted/looped.
      const { data } = await axios.post<RefreshResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      );

      useAuthStore.getState().setTokens(data);
      flush(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original); // retry the original request
    } catch (err) {
      flush(err, null);
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
