import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { authAPI } from "../services/api";

export const useAuth = () => {
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
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
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
