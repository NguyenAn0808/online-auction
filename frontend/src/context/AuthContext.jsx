import api from "../services/api";
import { createContext, useState, useEffect, useContext, useMemo } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // New State: functionality to switch views
  const [activeRole, setActiveRole] = useState("guest");

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setActiveRole(parsedUser.role || "guest");
    }
    setLoading(false);
  }, []);

  // Sync activeRole when user changes
  useEffect(() => {
    if (user) {
      // If the user is already set, ensure activeRole matches their capability
      // e.g. If I am 'seller', I start as 'seller'.
      // This check prevents activeRole from being stuck on 'guest' after login
      if (activeRole === "guest") {
        setActiveRole(user.role);
      }
    } else {
      setActiveRole("guest");
    }
  }, [user]);

  const signin = async (login, password) => {
    try {
      console.log("Attempting signin with:", { login, password: "***" });
      const response = await api.post("/auth/signin", { login, password });
      console.log("Signin response:", response.data);

      const { accessToken, user: userData } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setActiveRole(userData.role); // Immediately set role on login
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

  // Allow switching roles ONLY if the user actually has permission
  const switchRole = (newRole) => {
    if (!user) return;

    // 1. ADMINS: Can switch to anything (God mode)
    if (user.role === "admin") {
      setActiveRole(targetRole);
      return;
    }

    // 2. SELLERS: Can ONLY switch to 'bidder' (or back to 'seller')
    // STRICTLY BLOCK switching to 'admin'
    if (user.role === "seller") {
      if (targetRole === "bidder" || targetRole === "seller") {
        setActiveRole(targetRole);
      } else {
        console.error("Security Alert: Seller attempted to switch to Admin.");
      }
      return;
    }

    // 3. BIDDERS: Cannot switch to anything
    if (user.role === "bidder") {
      console.warn("Bidders cannot switch roles.");
      return;
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      activeRole,
      switchRole,
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
