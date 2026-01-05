import { useState, useEffect } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as FunnelSolid } from "@heroicons/react/24/solid";
import Pagination from "../components/Pagination";
import upgradeRequestService from "../services/upgradeRequestService";
import userService from "../services/userService";
import { useToast } from "../context/ToastContext";
import FilterDropdown from "../components/FilterDropdown";

const SellerUpgradesPage = () => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const itemsPerPage = 10;
  const [userById, setUserById] = useState({});

  // Helper to get user info by user_id
  const getUserInfo = (userId) => {
    return userById[userId] || null;
  };

  // Helper to get admin info by admin_id
  const getAdminInfo = (adminId) => {
    if (!adminId) return null;
    return userById[adminId] || null;
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await upgradeRequestService.getAllRequests(params);

      // Handle response structure
      const data = response.data
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setRequests(data);

      // Prefetch user info for displayed requests
      const uniqueIds = Array.from(
        new Set(data.map((r) => [r.user_id, r.admin_id].filter(Boolean)).flat())
      );
      if (uniqueIds.length > 0) {
        try {
          const results = await Promise.all(
            uniqueIds.map((id) => userService.getUserById(id).catch(() => null))
          );
          const nextMap = {};
          results.forEach((u) => {
            if (u && u.id) nextMap[u.id] = u;
          });
          setUserById((prev) => ({ ...prev, ...nextMap }));
        } catch (e) {
          // ignore user fetch errors
        }
      }

      // Handle pagination
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user"));
        } catch {
          return null;
        }
      })();
      const adminId = currentUser?.id;
      if (!adminId) {
        toast.error("Missing admin ID. Please sign in again.");
        return;
      }

      await upgradeRequestService.approveRequest(requestId, adminId);
      toast.success("Request approved successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request. Please try again.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user"));
        } catch {
          return null;
        }
      })();
      const adminId = currentUser?.id;
      if (!adminId) {
        toast.error("Missing admin ID. Please sign in again.");
        return;
      }

      await upgradeRequestService.rejectRequest(requestId, adminId);
      toast.success("Request rejected successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getRemainingDays = (createdAt) => {
    const created = new Date(createdAt);
    const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from creation
    const now = new Date();
    const remaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return remaining;
  };

  const getRemainingDaysText = (days) => {
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const getRemainingDaysColor = (days) => {
    if (days < 0) return "text-red-600 font-medium";
    if (days <= 2) return "text-orange-600 font-medium";
    return "text-gray-700";
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      approved: "bg-green-100 text-green-700 border border-green-200",
      rejected: "bg-red-100 text-red-700 border border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          Seller Upgrade Requests
        </h3>
      </div>

      <div className="mb-6 flex items-center justify-between bg-white">
        <div className="text-lg text-gray-900">
          Showing <div className="font-bold inline">{requests.length} </div>
          requests
        </div>
        <div className="flex gap-2">
          {/* Status Filter - using shared FilterDropdown */}
          <FilterDropdown
            label="Status"
            value={
              statusFilter === "all"
                ? "All"
                : statusFilter === "pending"
                ? "Pending"
                : statusFilter === "approved"
                ? "Approved"
                : "Rejected"
            }
            options={[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
            isOpen={showStatusMenu}
            onToggle={() => setShowStatusMenu(!showStatusMenu)}
            onSelect={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
              setShowStatusMenu(false);
            }}
            Icon={FunnelIcon}
            ActiveIcon={FunnelSolid}
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                #
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                Requested At
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                Remaining
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((request, idx) => {
              const user = getUserInfo(request.user_id);
              return (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {request.user_name || user?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.user_email || user?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    {request.status === "pending" ? (
                      <span
                        className={`text-xs ${getRemainingDaysColor(
                          getRemainingDays(request.created_at)
                        )}`}
                      >
                        {getRemainingDaysText(
                          getRemainingDays(request.created_at)
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        request.status
                      )}`}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="!px-3 !py-1 btn-secondary rounded-md !text-xs !font-medium"
                      >
                        Details
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-3 py-1 !bg-green-50 border border-green-300 text-green-600 rounded-md text-xs font-medium !hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-3 py-1 !bg-red-50 !border-red-300 text-red-600 rounded-md text-xs font-medium !hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-gray-500 text-sm"
                >
                  No requests found.
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
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedRequest(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Request Details</h2>
            {(() => {
              const user = getUserInfo(selectedRequest.user_id);
              const admin = getAdminInfo(selectedRequest.admin_id);
              return (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        Full Name:
                      </span>
                      <p className="text-gray-900">
                        {selectedRequest.user_name ||
                          user?.fullName ||
                          "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">
                        {selectedRequest.user_email || user?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Address:
                      </span>
                      <p className="text-gray-900">{user?.address || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Birthdate:
                      </span>
                      <p className="text-gray-900">
                        {user?.birthdate ? formatDate(user.birthdate) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        User ID:
                      </span>
                      <p className="text-gray-900 text-xs">
                        {selectedRequest.user_id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Request ID:
                      </span>
                      <p className="text-gray-900 text-xs">
                        {selectedRequest.id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Requested At:
                      </span>
                      <p className="text-gray-900">
                        {formatDate(selectedRequest.created_at)}
                      </p>
                    </div>
                    {selectedRequest.status === "pending" && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Remaining:
                        </span>
                        <p
                          className={getRemainingDaysColor(
                            getRemainingDays(selectedRequest.created_at)
                          )}
                        >
                          {getRemainingDaysText(
                            getRemainingDays(selectedRequest.created_at)
                          )}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            selectedRequest.status
                          )}`}
                        >
                          {getStatusText(selectedRequest.status)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Current Role:
                    </span>
                    <p className="text-gray-900 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user?.role === "admin"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : user?.role === "seller"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {user?.role || "Unknown"}
                      </span>
                    </p>
                  </div>

                  {selectedRequest.reviewed_at && (
                    <>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <span className="font-medium text-gray-700">
                            Processed At:
                          </span>
                          <p className="text-gray-900">
                            {formatDate(selectedRequest.reviewed_at)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Processed By:
                          </span>
                          <p className="text-gray-900">
                            {selectedRequest.admin_name ||
                              admin?.fullName ||
                              "Unknown Admin"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
            <div className="mt-6 flex justify-end gap-3">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 text-sm !bg-green-600 text-white rounded-md !hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 text-sm !bg-red-600 text-white rounded-md !hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerUpgradesPage;
