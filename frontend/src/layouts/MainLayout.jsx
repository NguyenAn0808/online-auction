import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  // Hide chat bubble on auth pages (e.g. /auth/login, /auth/signup)
  const showChat = user && !pathname.startsWith("/auth");

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
