import pool from "../config/database.js";

// Table init (use with migration only)
export const initBidsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bids (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL,
      bidder_id INTEGER NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'rejected', 'accepted')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
    CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
    CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
  `;
  await pool.query(query);
};

class Bid {
  static async add({ product_id, bidder_id, amount }) {
    const query = `
      INSERT INTO bids (product_id, bidder_id, amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [product_id, bidder_id, amount]);
    return result.rows[0];
  }

  static async getByProduct(product_id, status = null) {
    let query = `SELECT * FROM bids WHERE product_id = $1`;
    const params = [product_id];
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }
    query += " ORDER BY timestamp DESC";
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(bid_id) {
    const query = `SELECT * FROM bids WHERE id = $1`;
    const result = await pool.query(query, [bid_id]);
    return result.rows[0];
  }

  static async accept(bid_id) {
    const query = `UPDATE bids SET status = 'accepted' WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [bid_id]);
    return result.rows[0];
  }

  static async reject(bid_id) {
    const query = `UPDATE bids SET status = 'rejected' WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [bid_id]);
    return result.rows[0];
  }

  static async getByUser(bidder_id) {
    const query = `SELECT * FROM bids WHERE bidder_id = $1 ORDER BY timestamp DESC`;
    const result = await pool.query(query, [bidder_id]);
    return result.rows;
  }
}

export default Bid;
