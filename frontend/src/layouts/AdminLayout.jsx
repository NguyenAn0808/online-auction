import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-whisper">
      <Header />
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        <AdminSidebar />
        <main className="flex-1">
          <Outlet key={pathname} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
