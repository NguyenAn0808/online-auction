import pool from "../config/database.js";

export const initBlockedBiddersTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS blocked_bidders (
      product_id UUID NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (product_id, user_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_blocked_bidders_product ON blocked_bidders(product_id);
  `;

  try {
    await pool.query(query);
  } catch (error) {
    console.log("Error creating blocked_bidders table:", error);
  }
};

class BlockedBidderModel {
  static async create(product_id, user_id) {
    const query = `
      INSERT INTO blocked_bidders (product_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (product_id, user_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [product_id, user_id]);
    return result.rows[0];
  }

  static async isBlocked(product_id, user_id) {
    const query = `
      SELECT 1 FROM blocked_bidders 
      WHERE product_id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [product_id, user_id]);
    return result.rows.length > 0;
  }
  static async remove(product_id, user_id) {
    const query = `
      DELETE FROM blocked_bidders 
      WHERE product_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [product_id, user_id]);
    return result.rows[0];
  }

  static async getByProduct(product_id) {
    const query = `
      SELECT bb.*, u.full_name as bidder_name 
      FROM blocked_bidders bb
      JOIN users u ON bb.user_id = u.id
      WHERE bb.product_id = $1
      ORDER BY bb.created_at DESC
    `;
    const result = await pool.query(query, [product_id]);
    return result.rows;
  }
}

export default BlockedBidderModel;
