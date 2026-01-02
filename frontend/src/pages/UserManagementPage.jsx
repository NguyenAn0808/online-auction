import { useState, useEffect } from "react";
import userService from "../services/userService";
import Pagination from "../components/Pagination";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [roleFilter, setRoleFilter] = useState("all");
  // Removed verification filter
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  // Removed verification menu
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortBy, sortOrder, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        search: searchQuery,
      };

      // Add filters only if not "all"
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      const response = await userService.getAllUsers(params);
      const normalized = Array.isArray(response.data)
        ? response.data.map((u) => ({
            ...u,
            fullname:
              u.fullname ||
              u.full_name ||
              u.fullName ||
              [u.first_name, u.last_name].filter(Boolean).join(" ") ||
              u.username ||
              "Unknown",
          }))
        : [];
      setUsers(normalized);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border border-red-200";
      case "seller":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "bidder":
        return "bg-green-100 text-green-700 border border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getDisplayName = (user) =>
    user.fullname ||
    user.full_name ||
    user.fullName ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    "Unknown";

  const headerCell = (label, field, extraClass = "") => (
    <th
      onClick={() => toggleSort(field)}
      className={`px-3 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none group ${extraClass}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortBy === field && (
          <span className="text-xs text-gray-500">
            {sortOrder === "asc" ? "▲" : "▼"}
          </span>
        )}
        {sortBy !== field && (
          <span className="opacity-0 group-hover:opacity-30 text-xs">▲</span>
        )}
      </span>
    </th>
  );

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          User Management
        </h3>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name, email, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 pl-4 pr-4 py-2.5 border border-gray-300 hover:border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50 transition-all"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 !bg-blue-600 text-white rounded-full font-medium text-sm"
          >
            Search
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-md text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">{users.length}</span>{" "}
            users
          </div>
          <div className="flex gap-3">
            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowSortMenu(false);
                  setShowOrderMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-md">
                  Role:{" "}
                  {roleFilter === "all"
                    ? "All"
                    : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                </span>
              </button>
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y">
                  <button
                    onClick={() => {
                      setRoleFilter("all");
                      setCurrentPage(1);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      roleFilter === "all"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setRoleFilter("admin");
                      setCurrentPage(1);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      roleFilter === "admin"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      setRoleFilter("seller");
                      setCurrentPage(1);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      roleFilter === "seller"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Seller
                  </button>
                  <button
                    onClick={() => {
                      setRoleFilter("bidder");
                      setCurrentPage(1);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      roleFilter === "bidder"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Bidder
                  </button>
                </div>
              )}
            </div>

            {/* Sort By */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowRoleMenu(false);
                  setShowOrderMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-md">
                  Sort:{" "}
                  {sortBy === "createdAt"
                    ? "Created At"
                    : sortBy === "updatedAt"
                    ? "Updated At"
                    : sortBy === "fullname"
                    ? "Full Name"
                    : "Email"}
                </span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y">
                  <button
                    onClick={() => {
                      setSortBy("createdAt");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      sortBy === "createdAt"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Created At
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("updatedAt");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      sortBy === "updatedAt"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Updated At
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("fullname");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      sortBy === "fullname"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Full Name
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("email");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      sortBy === "email"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Email
                  </button>
                </div>
              )}
            </div>

            {/* Order */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowOrderMenu(!showOrderMenu);
                  setShowRoleMenu(false);
                  setShowSortMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-md">
                  Order: {sortOrder === "asc" ? "Asc" : "Desc"}
                </span>
              </button>
              {showOrderMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y">
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setShowOrderMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      sortOrder === "asc"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Asc
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setShowOrderMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-md hover:bg-gray-50 ${
                      sortOrder === "desc"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    Desc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                #
              </th>
              {headerCell("Full Name", "fullname")}
              {headerCell("Email", "email")}
              {headerCell("Role", "role")}
              <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user, idx) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-500">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td className="px-3 py-2 font-medium text-gray-900">
                  {getDisplayName(user)}
                </td>
                <td className="px-3 py-2 text-gray-700">{user.email}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="!px-3 !py-1 btn-secondary !text-xs font-medium hover:bg-gray-100"
                    >
                      Details
                    </button>
                    <button className="!px-3 !py-1 bg-red-100 text-red-700 !border !border-red-200 text-xs rounded-[6px] hover:!bg-red-200 font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-gray-500 text-sm"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Full Name:</span>{" "}
                {getDisplayName(selectedUser)}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedUser.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {selectedUser.role}
              </div>
              <div>
                <span className="font-medium">Birthdate:</span>{" "}
                {formatDate(selectedUser.birthdate)}
              </div>
              <div>
                <span className="font-medium">Address:</span>{" "}
                {selectedUser.address}
              </div>
              <div>
                <span className="font-medium">Created At:</span>{" "}
                {formatDate(selectedUser.createdAt)}
              </div>
              <div>
                <span className="font-medium">Updated At:</span>{" "}
                {formatDate(selectedUser.updatedAt)}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
