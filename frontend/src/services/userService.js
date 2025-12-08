import api from "./api";
import usersData from "../data/users.json";

const userService = {
  // Get all users with filtering, sorting, and pagination
  getAllUsers: async (params = {}) => {
    try {
      // Simulating API call with mock data
      // In production, replace with: const response = await api.get('/users', { params });

      let users = [...usersData];

      // Filter by search query
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        users = users.filter(
          (user) =>
            user.fullname.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.address.toLowerCase().includes(searchLower)
        );
      }

      // Filter by role
      if (params.role && params.role !== "all") {
        users = users.filter((user) => user.role === params.role);
      }

      // Filter by verification status
      if (params.is_verify !== undefined && params.is_verify !== "all") {
        const isVerify =
          params.is_verify === "true" || params.is_verify === true;
        users = users.filter((user) => user.is_verify === isVerify);
      }

      // Sort users
      if (params.sortBy) {
        users.sort((a, b) => {
          let aValue = a[params.sortBy];
          let bValue = b[params.sortBy];

          // Handle date sorting
          if (
            params.sortBy === "createdAt" ||
            params.sortBy === "updatedAt" ||
            params.sortBy === "birthdate"
          ) {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }

          // Handle string sorting
          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (params.sortOrder === "desc") {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Calculate pagination
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedUsers = users.slice(startIndex, endIndex);

      return {
        data: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(users.length / limit),
          totalItems: users.length,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      // Simulating API call with mock data
      // In production, replace with: const response = await api.get(`/users/${id}`);

      const user = usersData.find((u) => u.id === id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Verify user
  verifyUser: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/verify`);
      return response.data;
    } catch (error) {
      console.error("Error verifying user:", error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (id, role) => {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },
};

export default userService;
