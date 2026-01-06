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
      INSERT INTO bids (product_id, bidder_id, amount, max_bid, status)
      VALUES ($1, $2, $3, $4, 'accepted')
      RETURNING *
    `;
    const result = await pool.query(query, [
      product_id,
      bidder_id,
      amount,
      max_bid,
    ]);
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
      SELECT b.* FROM bids b
      LEFT JOIN blocked_bidders bb ON b.product_id = bb.product_id AND b.bidder_id = bb.user_id
      WHERE b.product_id = $1 
        AND b.status != 'rejected' 
        AND b.max_bid IS NOT NULL
        AND bb.user_id IS NULL
      ORDER BY b.max_bid DESC, b.timestamp ASC
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

  // Reject all active bids by a user for a product
  static async rejectBidsByUser(product_id, bidder_id) {
    const query = `
      UPDATE bids 
      SET status = 'rejected'
      WHERE product_id = $1 AND bidder_id = $2 AND status != 'rejected'
    `;
    await pool.query(query, [product_id, bidder_id]);
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
      SELECT b.* FROM bids b
      LEFT JOIN blocked_bidders bb ON b.product_id = bb.product_id AND b.bidder_id = bb.user_id
      WHERE b.product_id = $1 
        AND b.status != 'rejected'
        AND bb.user_id IS NULL
      ORDER BY b.amount DESC, b.timestamp DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [product_id]);
    return result.rows[0]; // Returns undefined if no bids exist
  }

  static async restoreBidsByUser(product_id, bidder_id) {
    const query = `
      UPDATE bids 
      SET status = 'accepted'
      WHERE product_id = $1 AND bidder_id = $2 AND status = 'rejected'
    `;
    await pool.query(query, [product_id, bidder_id]);
  }

  // Get all unique bidders with their email for a product
  static async getUniqueBiddersWithEmail(product_id) {
    const query = `
      SELECT DISTINCT u.id, u.email, u.full_name
      FROM bids b
      JOIN users u ON b.bidder_id = u.id
      LEFT JOIN blocked_bidders bb ON b.product_id = bb.product_id AND b.bidder_id = bb.user_id
      WHERE b.product_id = $1 
        AND b.status != 'rejected'
        AND bb.user_id IS NULL
    `;
    const result = await pool.query(query, [product_id]);
    return result.rows;
  }
}

export default Bid;
