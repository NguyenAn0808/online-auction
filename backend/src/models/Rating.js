import pool from "../config/database.js";

export const initRatingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ratings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL,
      reviewer_id UUID NOT NULL,
      target_user_id UUID NOT NULL,
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
  static async add({
    product_id,
    reviewer_id,
    target_user_id,
    score,
    comment,
  }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Insert rating
      const insertQuery = `
        INSERT INTO ratings (product_id, reviewer_id, target_user_id, score, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const insertValues = [
        product_id,
        reviewer_id,
        target_user_id,
        score,
        comment || "",
      ];
      const result = await client.query(insertQuery, insertValues);

      // Update target user's rating_points
      const updateUserQuery = `
        UPDATE users 
        SET rating_points = rating_points + $1,
            updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(updateUserQuery, [score, target_user_id]);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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

  static async getUserRatingByReviewerAndProduct(
    target_user_id,
    reviewer_id,
    product_id
  ) {
    const query = `
      SELECT * FROM ratings WHERE target_user_id = $1 AND reviewer_id = $2 AND product_id = $3
    `;
    const result = await pool.query(query, [
      target_user_id,
      reviewer_id,
      product_id,
    ]);
    return result.rows[0];
  }

  static async getRatingCountByOrder(orderId) {
    try {
      const query = `
          SELECT COUNT(r.id)
          FROM ratings r
          JOIN orders o ON r.product_id = o.product_id
          WHERE o.id = $1
          AND r.reviewer_id IN (o.buyer_id, o.seller_id)
          AND r.score IS NOT NULL;
      `;

      const result = await pool.query(query, [orderId]);
      // COUNT(*) returns the count as a string, so parse it to an integer
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error("Error in Rating.getRatingCountByOrder:", error);
      // Re-throw the error so the controller can catch the 500
      throw error;
    }
  }
}

export default Rating;
