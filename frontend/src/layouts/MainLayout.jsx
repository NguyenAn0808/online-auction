import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";

const MainLayout = () => {
  return (
    <>
      <Outlet />
      <Footer />
      <ChatBubble />
    </>
  );
};

export default MainLayout;
