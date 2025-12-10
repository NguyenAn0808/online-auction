import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";

const MainLayout = () => {
  const { pathname } = useLocation();

  // Hide chat bubble on auth pages (e.g. /auth/login, /auth/signup)
  const showChat = !pathname.startsWith("/auth");

  return (
    <>
      <Outlet />
      <Footer />
      {showChat && <ChatBubble />}
    </>
  );
};

export default MainLayout;
