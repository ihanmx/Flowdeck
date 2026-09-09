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
  hasHydrated: boolean;

  //   functions that modify the state

  setAuth: (data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setTokens: (data: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    //set returns the store initial state and actions
    (set) => ({
      user: null, //initial values
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }), //called in login and register

      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }), //called in refresh token
      clearAuth: () =>
        //called in logout and on 401 (unauthorized)
        set({ user: null, accessToken: null, refreshToken: null }),
      //insure that the store knows when it has been hydrated from localStorage (so we don't try to read the auth state before it's ready)
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),

    {
      name: "flowdeck-auth", // Only persist the real auth data — NOT the hydration flag (it must start false each load).
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      // Runs once, after the store finishes reading from localStorage.
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }, //local storage key
  ),
);

// hasHydrated	"has localStorage been loaded yet?" (starts false)
// setHasHydrated	the switch to flip that flag
// partialize	"only save user + tokens — not the loading flag"
// onRehydrateStorage	"when loading finishes, flip the flag to true"
