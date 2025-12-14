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
    <>
      <Outlet />
      <Footer />
      {showChat && <ChatBubble />}
    </>
  );
};

export default MainLayout;
