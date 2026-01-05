import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

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
      {/* Dashboard */}
      <button
        onClick={() => handleNavigate("/admin")}
        className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-whisper hover:text-pebble ${
          isActive("/admin") || isActive("/admin/")
            ? "!font-semibold bg-whisper text-midnight-ash"
            : ""
        }`}
      >
        Dashboard overview
      </button>

      {/* Management Section */}
      <div className="mt-2">
        <div className="w-full px-3 py-2 rounded-md transition flex items-center justify-between">
          Management
          <button onClick={() => toggleSection("management")}>
            <EllipsisVerticalIcon className="w-5 h-5 hover:bg-whisper hover:text-pebble rounded" />
          </button>
        </div>

        {expandedSection === "management" && (
          <div className="ml-4 mt-1 space-y-1">
            <button
              onClick={() => handleNavigate("/admin/categories")}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-whisper hover:text-pebble focus:outline-none ${
                isActive("/admin/categories")
                  ? "!font-semibold bg-whisper text-midnight-ash"
                  : ""
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNavigate("/admin/products")}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-whisper hover:text-pebble focus:outline-none ${
                isActive("/admin/products")
                  ? "!font-semibold bg-whisper text-midnight-ash"
                  : ""
              }`}
            >
              Products
            </button>
            <button
              onClick={() => handleNavigate("/admin/users")}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-whisper hover:text-pebble focus:outline-none ${
                isActive("/admin/users")
                  ? "!font-semibold bg-whisper text-midnight-ash"
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
        className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-whisper hover:text-pebble mt-1 ${
          isActive("/admin/seller-upgrades")
            ? "!font-semibold bg-whisper text-midnight-ash"
            : ""
        }`}
      >
        Seller upgrades
      </button>
    </div>
  );
};

export default AdminSidebar;
