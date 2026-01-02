import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const [expandedSection, setExpandedSection] = useState("management");
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Admin Panel</h3>

      {/* Dashboard */}
      <button
        onClick={() => handleNavigate("/admin")}
        className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-gray-50 ${
          isActive("/admin") || isActive("/admin/")
            ? "!font-semibold !bg-gray-200 !text-gray-900"
            : ""
        }`}
      >
        Dashboard overview
      </button>

      {/* Management Section */}
      <div className="mt-2">
        <button
          onClick={() => toggleSection("management")}
          className="w-full text-left px-3 py-2 rounded-md transition hover:bg-gray-50 focus:outline-none font-semibold"
        >
          Management
        </button>

        {expandedSection === "management" && (
          <div className="ml-4 mt-1 space-y-1">
            <button
              onClick={() => handleNavigate("/admin/categories")}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-gray-50 focus:outline-none ${
                isActive("/admin/categories")
                  ? "!font-semibold !bg-gray-200 !text-gray-900"
                  : ""
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNavigate("/admin/products")}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-gray-50 focus:outline-none ${
                isActive("/admin/products")
                  ? "!font-semibold !bg-gray-200 !text-gray-900"
                  : ""
              }`}
            >
              Products
            </button>
            <button
              onClick={() => handleNavigate("/admin/users")}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-gray-50 focus:outline-none ${
                isActive("/admin/users")
                  ? "!font-semibold !bg-gray-200 !text-gray-900"
                  : ""
              }`}
            >
              Users
            </button>
          </div>
        )}
      </div>

      {/* Seller upgrades */}
      <button
        onClick={() => handleNavigate("/admin/seller-upgrades")}
        className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-gray-50 mt-1 ${
          isActive("/admin/seller-upgrades")
            ? "!font-semibold !bg-gray-200 !text-gray-900"
            : ""
        }`}
      >
        Seller upgrades
      </button>
    </div>
  );
};

export default AdminSidebar;
