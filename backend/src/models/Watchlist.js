import pool from "../config/database.js";

// Table init (call manually in DB setup scripts)
export const initWatchlistTable = async () => {
  // Check if table exists with wrong schema (INTEGER instead of UUID)
  const checkSchemaQuery = `
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'user_id'
  `;
  const schemaResult = await pool.query(checkSchemaQuery);

  // If table exists with wrong type, drop and recreate
  if (schemaResult.rows.length > 0 && schemaResult.rows[0].data_type !== 'uuid') {
    console.log("Migrating watchlist table: changing user_id from INTEGER to UUID...");
    await pool.query("DROP TABLE IF EXISTS watchlist CASCADE");
  }

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id UUID NOT NULL,
      product_id UUID NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `;
  await pool.query(createTableQuery);
  console.log("Watchlist table initialized");
};

class Watchlist {
  static async add(user_id, product_id) {
    const query = `
      INSERT INTO watchlist (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING user_id, product_id, added_at
    `;
    const result = await pool.query(query, [user_id, product_id]);
    return result.rows[0];
  }

  static async remove(user_id, product_id) {
    const query = `
      DELETE FROM watchlist WHERE user_id = $1 AND product_id = $2 RETURNING *
    `;
    const result = await pool.query(query, [user_id, product_id]);
    return result.rows[0];
  }

  static async getByUser(user_id) {
    const query = `
      SELECT product_id FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async isOnWatchlist(user_id, product_id) {
    const query = `
      SELECT 1 FROM watchlist WHERE user_id = $1 AND product_id = $2
    `;
    const result = await pool.query(query, [user_id, product_id]);
    return !!result.rows.length;
  }
}

export default Watchlist;
