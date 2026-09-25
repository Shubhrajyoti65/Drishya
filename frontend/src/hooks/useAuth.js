import { useEffect } from "react";
import { useClerk } from "@clerk/react";
import { useAuthStore } from "../stores/authStore";
import { authAPI } from "../services/api";

export const useAuth = () => {
  const clerk = useClerk();
  const { user, isAuthenticated, login, logout, initializeAuth } =
    useAuthStore();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      try {
        initializeAuth(JSON.parse(storedUser), storedToken);
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    }
  }, [initializeAuth]);

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      login(user, accessToken);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const handleRegister = async (formData) => {
    try {
      const response = await authAPI.register(formData);
      const { user, accessToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      login(user, accessToken);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token && !token.startsWith("clerk_token_")) {
        await authAPI.logout();
      }
    } catch (error) {
      // Silence backend logout errors (e.g. 401 Unauthorized if token expired)
    }

    if (clerk && typeof clerk.signOut === "function") {
      try {
        await clerk.signOut();
      } catch (error) {
        // Silence Clerk signout errors if already signed out
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    logout();
  };

  return {
    user,
    isAuthenticated,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
