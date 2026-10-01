import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrgState {
  activeOrgId: string | null;
  setActiveOrg: (id: string | null) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      setActiveOrg: (id) => set({ activeOrgId: id }),
    }),
    { name: "flowdeck-active-org" },
  ),
);
