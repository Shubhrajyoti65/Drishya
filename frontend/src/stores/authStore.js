import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),

  setAuthStatus: (status) => set({ isAuthenticated: status }),

  initializeAuth: (storedUser, storedToken) => {
    if (storedUser && storedToken) {
      set({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true,
      });
    }
  },
}));
