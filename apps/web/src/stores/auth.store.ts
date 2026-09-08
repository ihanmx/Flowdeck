import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}
//The shape of a logged-in user (matches what your backend returns from /auth/me and login).

interface AuthState {
  // --- the data (state) ---
  user: AuthUser | null; // null = logged out
  accessToken: string | null;
  refreshToken: string | null;

  //   functions that modify the state

  setAuth: (data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setTokens: (data: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    //set returns the store initial state and actions
    (set) => ({
      user: null, //initial values
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }), //called in login and register

      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }), //called in refresh token
      clearAuth: () =>
        //called in logout
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "flowdeck-auth" }, //local storage key
  ),
);
