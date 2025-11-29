import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        <AdminSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
