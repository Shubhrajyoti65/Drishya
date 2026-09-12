import { create } from "zustand";

const getInitialAuthState = () => {
  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialAuth = getInitialAuthState();

export const useAuthStore = create((set) => ({
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  token: initialAuth.token,

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
