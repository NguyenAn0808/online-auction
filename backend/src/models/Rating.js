import pool from "../config/database.js";

export const initRatingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ratings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL,
      reviewer_id INTEGER NOT NULL,
      target_user_id INTEGER NOT NULL,
      score SMALLINT NOT NULL CHECK (score IN (1, -1)),
      comment TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_ratings_target_user_id ON ratings(target_user_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_reviewer_id ON ratings(reviewer_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON ratings(product_id);
  `;
  await pool.query(query);
};

class Rating {
  static async add({ product_id, reviewer_id, target_user_id, score, comment }) {
    const query = `
      INSERT INTO ratings (product_id, reviewer_id, target_user_id, score, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [product_id, reviewer_id, target_user_id, score, comment || ""];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getUserRatings(target_user_id) {
    const query = `SELECT * FROM ratings WHERE target_user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [target_user_id]);
    return result.rows;
  }

  static async getUserScoreAndCount(target_user_id) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE score=1) AS positive,
        COUNT(*) FILTER (WHERE score=-1) AS negative,
        COUNT(*) AS total
      FROM ratings WHERE target_user_id = $1
    `;
    const result = await pool.query(query, [target_user_id]);
    return result.rows[0];
  }

  static async getUserRatingByReviewerAndProduct(target_user_id, reviewer_id, product_id) {
    const query = `
      SELECT * FROM ratings WHERE target_user_id = $1 AND reviewer_id = $2 AND product_id = $3
    `;
    const result = await pool.query(query, [target_user_id, reviewer_id, product_id]);
    return result.rows[0];
  }
}

export default Rating;
