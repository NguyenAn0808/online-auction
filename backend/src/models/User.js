import pool from "../config/database.js";

class User {
  // Create users table if not exists
  static async createTable() {
    try {
      // Create table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          hashed_password VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          full_name VARCHAR(255) NOT NULL,
          address TEXT,
          birthdate DATE,
          role VARCHAR(50) DEFAULT 'bidder',
          is_verified BOOLEAN DEFAULT FALSE,
          google_id VARCHAR(255) UNIQUE,
          facebook_id VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.query(createTableQuery);

      // Create indexes (ignore if they already exist)
      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
        );
      } catch (err) {
        // Index might already exist, ignore
      }

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)"
        );
      } catch (err) {
        // Index might already exist, ignore
      }

      console.log("Users table ready");
    } catch (error) {
      // If error is "already exists", just log and continue
      if (error.code === "23505" || error.code === "42P07") {
        console.log("Users table already exists");
        return;
      }
      console.error("Error creating users table:", error);
      throw error;
    }
  }

  //  Create new user
  static async create({
    username,
    hashedPassword,
    email,
    phone,
    fullName,
    address,
    birthdate,
    role = "bidder",
    isVerified = false,
    googleId = null,
    facebookId = null,
  }) {
    const query = `
      INSERT INTO users (username, hashed_password, email, phone, full_name, address, birthdate, role, is_verified, google_id, facebook_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, username, email, phone, full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
                google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [
      username.toLowerCase().trim(),
      hashedPassword,
      email.toLowerCase().trim(),
      phone,
      fullName.trim(),
      address,
      birthdate,
      role,
      isVerified,
      googleId,
      facebookId,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Username or email already exists");
      }
      throw error;
    }
  }

  //  Find user by ID
  static async findById(id) {
    const query = `
      SELECT id, username, email, phone, full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
             google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find user by username
  static async findByUsername(username) {
    const query = `
      SELECT id, username, hashed_password as "hashedPassword", email, phone, 
             full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
             google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE username = $1
    `;
    const result = await pool.query(query, [username.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Find user by Email
  static async findByEmail(email) {
    const query = `
      SELECT id, username, hashed_password as "hashedPassword", email, phone,
             full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
             google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE email = $1
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Update user password
  static async updatePassword(id, newHashedPassword) {
    const query = `
      UPDATE users
      SET hashed_password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, phone, full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
                google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    const values = [newHashedPassword, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete by id (fails when signup OTP verification is not completed)
  static async deleteById(id) {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update verification status
  static async updateVerificationStatus(id, isVerified = true) {
    const query = `
      UPDATE users
      SET is_verified = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, phone, full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
                google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    const result = await pool.query(query, [isVerified, id]);
    return result.rows[0] || null;
  }

  // Create user from social login (no password required)
  static async createSocialUser({
    username,
    email,
    fullName,
    googleId = null,
    facebookId = null,
    role = "bidder",
    isVerified = true,
  }) {
    const query = `
      INSERT INTO users (username, hashed_password, email, full_name, role, is_verified, google_id, facebook_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, phone, full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
                google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [
      username.toLowerCase().trim(),
      "", // Empty password for social login users
      email.toLowerCase().trim(),
      fullName.trim(),
      role,
      isVerified,
      googleId,
      facebookId,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Username or email already exists");
      }
      throw error;
    }
  }

  // Update social ID for existing user (link accounts)
  static async updateSocialId(id, provider, socialId) {
    const column = provider === "google" ? "google_id" : "facebook_id";
    const query = `
      UPDATE users
      SET ${column} = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, phone, full_name as "fullName", address, birthdate, role, is_verified as "isVerified",
                google_id as "googleId", facebook_id as "facebookId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    const result = await pool.query(query, [socialId, id]);
    return result.rows[0] || null;
  }
}

export default User;
