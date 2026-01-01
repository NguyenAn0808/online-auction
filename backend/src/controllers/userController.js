import pool from "../config/database.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

// Get all users (Removed is_verify filter)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];

    // REMOVED: is_verified from SELECT
    let query = `
      SELECT id, email, phone, full_name as "fullName", address, birthdate, 
             role, google_id as "googleId", facebook_id as "facebookId", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;

    // 1. Search Filter
    if (search) {
      params.push(`%${search}%`);
      const searchClause = ` AND (LOWER(full_name) LIKE LOWER($${params.length}) OR LOWER(email) LIKE LOWER($${params.length}) OR LOWER(address) LIKE LOWER($${params.length}))`;
      query += searchClause;
      countQuery += searchClause;
    }

    // 2. Role Filter
    if (role && role !== "all") {
      params.push(role);
      const roleClause = ` AND role = $${params.length}`;
      query += roleClause;
      countQuery += roleClause;
    }

    // REMOVED: Verification Status Filter Logic

    // 3. Sorting
    const sortMapping = {
      fullName: "full_name",
      email: "email",
      role: "role",
      createdAt: "created_at",
      updatedAt: "updated_at",
      birthdate: "birthdate",
    };

    const dbSortCol = sortMapping[sortBy] || "created_at";
    const order = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    query += ` ORDER BY ${dbSortCol} ${order}`;

    // 4. Pagination
    params.push(limit);
    query += ` LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, params.length - 2)),
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: usersResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    
    // Check if user has password before deleting it
    const hasPassword = !!(user.hashedPassword && user.hashedPassword.length > 0);
    delete user.hashedPassword;

    res.json({ 
      success: true, 
      data: {
        ...user,
        hasPassword
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createUser = async (req, res) => {
  try {
    // Exclude isVerified from input if passed
    const { password, isVerified, ...userData } = req.body;

    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      ...userData,
      hashedPassword,
    });

    // Clean response
    delete newUser.isVerified;

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, address, birthdate, email } = req.body;

  try {
    const query = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          address = COALESCE($3, address),
          birthdate = COALESCE($4, birthdate),
          email = COALESCE($5, email),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, email, phone, full_name as "fullName", address, birthdate, role
    `;

    const values = [fullName, phone, address, birthdate, email, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.deleteById(req.params.id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active history",
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// REMOVED: verifyUser function

export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["bidder", "seller", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, role, full_name as "fullName"
    `;
    const result = await pool.query(query, [role, id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
