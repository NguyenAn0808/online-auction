import UpgradeRequest from "../models/UpgradeRequest.js";

class UpgradeRequestController {
  // Create a new upgrade request
  static async createRequest(req, res) {
    try {
      const { reason, contact } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "Reason is required",
        });
      }

      // Check if user is already a seller or admin
      if (req.user.role === "seller" || req.user.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "You are already a seller or admin",
        });
      }

      // Check if user already has a pending request
      const hasPending = await UpgradeRequest.hasPendingRequest(userId);
      if (hasPending) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending upgrade request",
        });
      }

      // Handle uploaded documents (if any)
      const documents = req.files?.map((file) => file.path) || [];

      const request = await UpgradeRequest.create({
        userId,
        reason: reason.trim(),
        contact: contact || req.user.email,
        documents,
      });

      res.status(201).json({
        success: true,
        message: "Upgrade request submitted successfully",
        data: request,
      });
    } catch (error) {
      console.error("Error creating upgrade request:", error);

      // Handle unique constraint violation
      if (error.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "You already have a pending upgrade request",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to submit upgrade request",
      });
    }
  }

  // Get all upgrade requests (Admin only)
  static async getAllRequests(req, res) {
    try {
      const {
        status,
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
      } = req.query;

      const result = await UpgradeRequest.findAll({
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching upgrade requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upgrade requests",
      });
    }
  }

  // Get a specific upgrade request by ID
  static async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const request = await UpgradeRequest.findById(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Upgrade request not found",
        });
      }

      // Only allow admin or the request owner to view
      if (req.user.role !== "admin" && req.user.id !== request.user_id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error("Error fetching upgrade request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upgrade request",
      });
    }
  }

  // Get current user's upgrade requests
  static async getMyRequests(req, res) {
    try {
      const userId = req.user.id;
      const requests = await UpgradeRequest.findByUserId(userId);

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error("Error fetching user upgrade requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch your upgrade requests",
      });
    }
  }

  // Approve upgrade request (Admin only)
  static async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const result = await UpgradeRequest.approve(id, adminId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error approving upgrade request:", error);

      if (error.message === "Upgrade request not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to approve upgrade request",
      });
    }
  }

  // Reject upgrade request (Admin only)
  static async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const request = await UpgradeRequest.reject(id, adminId);

      res.json({
        success: true,
        message: "Upgrade request rejected",
        data: request,
      });
    } catch (error) {
      console.error("Error rejecting upgrade request:", error);

      if (error.message === "Upgrade request not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to reject upgrade request",
      });
    }
  }
}

export default UpgradeRequestController;
