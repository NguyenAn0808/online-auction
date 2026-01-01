import pool from "../config/database.js";

// Table init (use with migration only)
export const initBidsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bids (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL,
      bidder_id UUID NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      max_bid DECIMAL(12, 2),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'rejected', 'accepted')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
    CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
    CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
    CREATE INDEX IF NOT EXISTS idx_bids_max_bid ON bids(max_bid DESC);
  `;
  await pool.query(query);
};

class Bid {
  static async add({ product_id, bidder_id, amount, max_bid }) {
    const query = `
      INSERT INTO bids (product_id, bidder_id, amount, max_bid)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [product_id, bidder_id, amount, max_bid]);
    return result.rows[0];
  }

  // Update bid amount (used for auto-bid competition)
  static async updateAmount(bid_id, newAmount) {
    const query = `UPDATE bids SET amount = $2 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [bid_id, newAmount]);
    return result.rows[0];
  }

  // Get all active bids for auto-bid competition (ordered by max_bid DESC, timestamp ASC)
  static async getActiveBidsForCompetition(product_id) {
    const query = `
      SELECT * FROM bids
      WHERE product_id = $1 AND status != 'rejected' AND max_bid IS NOT NULL
      ORDER BY max_bid DESC, timestamp ASC
    `;
    const result = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Get existing bid by user for a product (to allow increasing max_bid)
  static async getByProductAndBidder(product_id, bidder_id) {
    const query = `
      SELECT * FROM bids
      WHERE product_id = $1 AND bidder_id = $2 AND status != 'rejected'
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [product_id, bidder_id]);
    return result.rows[0];
  }

  // Update max_bid for existing bid
  static async updateMaxBid(bid_id, newMaxBid) {
    const query = `UPDATE bids SET max_bid = $2 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [bid_id, newMaxBid]);
    return result.rows[0];
  }

  static async getByProduct(product_id, status = null) {
    let query = `
      SELECT b.*, u.full_name as bidder_name 
      FROM bids b
      JOIN users u ON b.bidder_id = u.id
      WHERE b.product_id = $1
    `;
    const params = [product_id];
    if (status) {
      query += ` AND b.status = $2`;
      params.push(status);
    }
    query += " ORDER BY b.timestamp DESC";
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

  static async rejectBidderForProduct(product_id, bidder_id) {
    const query = `
    UPDATE bids 
    SET status = 'rejected'
    WHERE product_id = $1 AND bidder_id = $2 AND status != 'rejected'`;

    await pool.query(query, [product_id, bidder_id]);
  }

  static async getHighest(product_id) {
    const query = `
      SELECT * FROM bids 
      WHERE product_id = $1 AND status != 'rejected'
      ORDER BY amount DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [product_id]);
    return result.rows[0]; // Returns undefined if no bids exist
  }
}

export default Bid;
