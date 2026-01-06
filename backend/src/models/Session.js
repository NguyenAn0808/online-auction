import pool from "../config/database.js";

/**
 * Session Model for PostgreSQL/Supabase
 * Handles refresh tokens and user sessions
 */
class Session {
  static async createTable() {
    try {
      // Create table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          refresh_token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.query(createTableQuery);

      // Create indexes (ignore if they already exist)
      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)"
        );
      } catch (err) {
        // Index might already exist, ignore
      }

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token)"
        );
      } catch (err) {
        // Index might already exist, ignore
      }

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)"
        );
      } catch (err) {
        // Index might already exist, ignore
      }

      console.log("Sessions table ready");
    } catch (error) {
      // If error is "already exists", just log and continue
      if (error.code === "23505" || error.code === "42P07") {
        console.log("Sessions table already exists");
        return;
      }
      console.error("Error creating sessions table:", error);
      throw error;
    }
  }

  // Create new deleteExpiredSessions
  static async create({ userId, refreshToken, expiresAt }) {
    const query = `
      INSERT INTO sessions (user_id, refresh_token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id as "userId", refresh_token as "refreshToken", 
                expires_at as "expiresAt", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [userId, refreshToken, expiresAt];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Refresh token already exists");
      }
      if (error.code === "23503") {
        // Foreign key violation
        throw new Error("User does not exist");
      }
      throw error;
    }
  }

  // Find session by refresh token
  static async findByRefreshToken(refreshToken) {
    const query = `
      SELECT id, user_id as "userId", refresh_token as "refreshToken",
             expires_at as "expiresAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM sessions
      WHERE refresh_token = $1 AND expires_at > NOW()
    `;

    const result = await pool.query(query, [refreshToken]);
    return result.rows[0] || null;
  }

  // Find all sessions for a user
  static async findByUserId(userId) {
    const query = `
      SELECT id, user_id as "userId", refresh_token as "refreshToken",
             expires_at as "expiresAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM sessions
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Find session by ID
  static async findById(id) {
    const query = `
      SELECT id, user_id as "userId", refresh_token as "refreshToken",
             expires_at as "expiresAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM sessions
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Delete session by refresh token
  static async deleteByRefreshToken(refreshToken) {
    const query = `
      DELETE FROM sessions
      WHERE refresh_token = $1
      RETURNING id
    `;
    const result = await pool.query(query, [refreshToken]);
    return result.rows[0] || null;
  }

  // Delete all by userId
  static async deleteAllByUserId(userId) {
    const query = `
      DELETE FROM sessions
      WHERE user_id = $1
    `;
    await pool.query(query, [userId]);
  }
}
export default Session;
