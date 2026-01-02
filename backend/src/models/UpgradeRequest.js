import pool from "../config/database.js";

class UpgradeRequest {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS upgrade_requests (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        contact VARCHAR(255),
        documents TEXT[], -- Array of document URLs
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, status) -- Prevent multiple pending requests from same user
      );

      CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_id ON upgrade_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON upgrade_requests(status);
      CREATE INDEX IF NOT EXISTS idx_upgrade_requests_created_at ON upgrade_requests(created_at DESC);
    `;

    try {
      await pool.query(query);
      console.log("✅ upgrade_requests table ready");
    } catch (error) {
      console.error("Error creating upgrade_requests table:", error);
      throw error;
    }
  }

  static async create({ userId, reason, contact, documents = [] }) {
    const query = `
      INSERT INTO upgrade_requests (user_id, reason, contact, documents)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId,
        reason,
        contact,
        documents,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating upgrade request:", error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT 
        ur.*,
        u.full_name as user_name,
        u.email as user_email,
        admin.full_name as admin_name
      FROM upgrade_requests ur
      LEFT JOIN users u ON ur.user_id = u.id
      LEFT JOIN users admin ON ur.admin_id = admin.id
      WHERE ur.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding upgrade request:", error);
      throw error;
    }
  }

  static async findAll({
    status,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  }) {
    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;

    let query = `
      SELECT 
        ur.*,
        u.full_name as user_name,
        u.email as user_email,
        admin.full_name as admin_name
      FROM upgrade_requests ur
      LEFT JOIN users u ON ur.user_id = u.id
      LEFT JOIN users admin ON ur.admin_id = admin.id
      WHERE 1=1
    `;

    if (status && status !== "all") {
      paramCount++;
      query += ` AND ur.status = $${paramCount}`;
      params.push(status);
    }

    // Sorting
    const validSortColumns = {
      created_at: "ur.created_at",
      updated_at: "ur.updated_at",
      status: "ur.status",
      user_name: "u.full_name",
    };
    const sortColumn = validSortColumns[sortBy] || "ur.created_at";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${sortColumn} ${order}`;

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    try {
      const result = await pool.query(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM upgrade_requests ur WHERE 1=1`;
      const countParams = [];
      if (status && status !== "all") {
        countQuery += ` AND ur.status = $1`;
        countParams.push(status);
      }
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error finding upgrade requests:", error);
      throw error;
    }
  }

  static async approve(id, adminId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get the request
      const requestResult = await client.query(
        "SELECT user_id FROM upgrade_requests WHERE id = $1",
        [id]
      );

      if (requestResult.rows.length === 0) {
        throw new Error("Upgrade request not found");
      }

      const userId = requestResult.rows[0].user_id;

      // Update the request status
      const updateRequestQuery = `
        UPDATE upgrade_requests
        SET status = 'approved', admin_id = $1, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      await client.query(updateRequestQuery, [adminId, id]);

      // Update user role to seller
      const updateUserQuery = `
        UPDATE users
        SET role = 'seller', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, role
      `;
      await client.query(updateUserQuery, [userId]);

      await client.query("COMMIT");

      return {
        success: true,
        message: "Request approved and user upgraded to seller",
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error approving upgrade request:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async reject(id, adminId) {
    const query = `
      UPDATE upgrade_requests
      SET status = 'rejected', admin_id = $1, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [adminId, id]);

      if (result.rows.length === 0) {
        throw new Error("Upgrade request not found");
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error rejecting upgrade request:", error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM upgrade_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error finding user upgrade requests:", error);
      throw error;
    }
  }

  static async hasPendingRequest(userId) {
    const query = `
      SELECT id FROM upgrade_requests
      WHERE user_id = $1 AND status = 'pending'
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking pending request:", error);
      throw error;
    }
  }
}

export default UpgradeRequest;
