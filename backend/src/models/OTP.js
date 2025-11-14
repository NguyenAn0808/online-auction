import pool from "../config/database.js";

/**
 * OTP Model for PostgreSQL
 * Handles OTP storage and verification
 */
class OTP {
  static async createTable() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp_code VARCHAR(6) NOT NULL,
          purpose VARCHAR(50) NOT NULL default 'signup',
          attempts INTEGER DEFAULT 0,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified BOOLEAN DEFAULT FALSE )`;

      await pool.query(createTableQuery);

      // Create indexes
      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email)"
        );
      } catch (error) {}

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at)"
        );
      } catch (error) {}

      console.log("OTPs table ready");
    } catch (error) {
      if (error.code === "23505" || error.code === "42P07") {
        console.log("OTPs table already exists");
        return;
      }
      console.error("Error creating otps table:", error);
      throw error;
    }
  }

  // Create new OTP
  static async create(email, otpCode, purpose = "signup", expiresAt) {
    const query = `
    INSERT INTO otps (email, otp_code, purpose, expires_at) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id, email, otp_code as "otpCode", purpose, attempts, 
    expires_at as "expiresAt", created_at as "createdAt", verified`;
    const values = [email.toLowerCase().trim(), otpCode, purpose, expiresAt];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating OTP:", error);
      throw error;
    }
  }

  // Find active OTP by email and purpose
  static async findActiveOTP(email, purpose = "signup") {
    const query = `
      SELECT id, email, otp_code as "otpCode", purpose, attempts,
             expires_at as "expiresAt", created_at as "createdAt", verified
      FROM otps
      WHERE email = $1 AND purpose = $2 AND expires_at > NOW() AND verified = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [email.toLowerCase(), purpose]);
    return result.rows[0] || null;
  }

  // Find most recent OTP (active or expired) to check cooldown
  static async findRecentOTP(email, purpose = "signup") {
    const query = `
      SELECT id, email, otp_code as "otpCode", purpose, attempts,
             expires_at as "expiresAt", created_at as "createdAt", verified
      FROM otps
      WHERE email = $1 AND purpose = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [email.toLowerCase(), purpose]);
    return result.rows[0] || null;
  }

  // Increment OTP attempts
  static async incrementAttempts(id) {
    const query = `
      UPDATE otps
      SET attempts = attempts + 1
      WHERE id = $1
      RETURNING attempts
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0]?.attempts || 0;
  }

  // Mark OTP as verified
  static async markAsVerified(id) {
    const query = `
      UPDATE otps
      SET verified = TRUE
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Delete by email and purpose
  static async deleteByEmail(email, purpose = "signup") {
    const query = `
      DELETE FROM otps
      WHERE email = $1 AND purpose = $2
    `;

    await pool.query(query, [email.toLowerCase(), purpose]);
  }

  // find recent OTP
  static async findRecentOTP(email, purpose = "signup", interval = 0) {
    const query = `
      SELECT id, email, otp_code as "otpCode", purpose, attempts,
             expires_at as "expiresAt", created_at as "createdAt", verified
      FROM otps
      WHERE email = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '${interval} milliseconds'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [email.toLowerCase(), purpose]);
    return result.rows[0] || null;
  }
}

export default OTP;
