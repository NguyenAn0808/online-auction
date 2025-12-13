import api from "../services/api";
import { createContext, useState, useEffect, useContext, useMemo } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signin = async (login, password) => {
    try {
      console.log("Attempting signin with:", { login, password: "***" });
      const response = await api.post("/auth/signin", { login, password });
      console.log("Signin response:", response.data);

      const { accessToken, user: userData } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Signin error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Signin failed",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };
  const signout = async () => {
    try {
      await api.post("/auth/signout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signin,
      signup,
      signout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isSeller: user?.role === "seller",
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
