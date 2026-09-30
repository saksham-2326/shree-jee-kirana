import { create } from "zustand";
import { Profile } from "../types/models";

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: any, profile: Profile | null) => void;
  setProfile: (profile: Profile) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (user, profile) =>
    set({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading: false,
    }),

  setProfile: (profile) => set({ profile }),

  clearSession: () =>
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
