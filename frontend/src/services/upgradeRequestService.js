import api from "./api";
import upgradeRequestsMock from "../data/upgradeRequests.json";

const upgradeRequestService = {
  // Get all upgrade requests with filtering and pagination
  getAllRequests: async (params = {}) => {
    try {
      // Try API call first
      try {
        const response = await api.get("/upgrade-requests", { params });
        return response.data;
      } catch (apiError) {
        console.warn("API call failed, using mock data:", apiError.message);

        // Fallback to mock data
        let requests = [...upgradeRequestsMock];

        // Filter by status
        if (params.status && params.status !== "all") {
          requests = requests.filter((req) => req.status === params.status);
        }

        // Calculate pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedRequests = requests.slice(startIndex, endIndex);

        return {
          data: paginatedRequests,
          pagination: {
            page,
            limit,
            total: requests.length,
            totalPages: Math.ceil(requests.length / limit),
          },
        };
      }
    } catch (error) {
      console.error("Error fetching upgrade requests:", error);
      throw error;
    }
  },

  // Get upgrade request by ID
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/upgrade-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching upgrade request:", error);
      throw error;
    }
  },

  // Approve upgrade request
  approveRequest: async (id, adminId) => {
    try {
      const response = await api.post(`/upgrade-requests/${id}/approve`, {
        admin_id: adminId,
      });
      return response.data;
    } catch (error) {
      console.error("Error approving upgrade request:", error);
      throw error;
    }
  },

  // Reject upgrade request
  rejectRequest: async (id, adminId) => {
    try {
      const response = await api.post(`/upgrade-requests/${id}/reject`, {
        admin_id: adminId,
      });
      return response.data;
    } catch (error) {
      console.error("Error rejecting upgrade request:", error);
      throw error;
    }
  },
};

export default upgradeRequestService;
