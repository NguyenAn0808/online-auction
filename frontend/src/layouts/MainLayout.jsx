import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();
  // Hide chat bubble on auth pages (e.g. /auth/login, /auth/signup)
  const showChat = user && !location.pathname.startsWith("/auth");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auto-redirect admins landing on "/" to admin dashboard, with bypass via query
  useEffect(() => {
    const isAdmin =
      user?.role === "admin" ||
      activeRole === "admin" ||
      user?.roles?.includes?.("admin");
    const params = new URLSearchParams(location.search);
    const bypass = params.get("view") === "storefront"; // allow normal view
    if (isAdmin && location.pathname === "/" && !bypass) {
      navigate("/admin", { replace: true });
    }
  }, [
    user?.role,
    activeRole,
    user?.roles,
    location.pathname,
    location.search,
    navigate,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area - flex-grow makes it fill available space */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer stays at bottom */}
      <Footer />
      {/* Chat bubble (fixed position, outside flex flow) */}
      {showChat && <ChatBubble />}
    </div>
  );
};

export default MainLayout;
