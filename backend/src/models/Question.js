import pool from "../config/database.js";

class Question {
  static async createTable() {
    try {
      // Create table
      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS questions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

      await pool.query(createTableQuery);

      // Create indexes (ignore if they already exist)
      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_questions_product_id ON questions(product_id)"
        );
      } catch (err) {}

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id)"
        );
      } catch (err) {}

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at)"
        );
      } catch (err) {}

      console.log("Questions table ready");
    } catch (error) {
      if (error.code === "23505" || error.code === "42P07") {
        console.log("Questions table already exists");
        return;
      }
      console.error("Error creating questions table:", error);
      throw error;
    }
  }

  static async create({ productId, userId, questionText }) {
    const query = `
    INSERT INTO questions (product_id, user_id, question_text)
    VALUES ($1, $2, $3)
    RETURNING id, product_id as "productId", user_id as "userId",
    question_text as "questionText",
    created_at as "createdAt", updated_at as "updatedAt"`;
    const values = [productId, userId, questionText];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23503") {
        console.error("Foreign key constraint violation:", error);
        throw new Error("Invalid productId or userId");
      }
      throw error;
    }
  }

  static async update({ questionId, userId, questionText }) {
    const query = `
    UPDATE questions
    SET question_text = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND user_id = $3 
    RETURNING *
    `;

    const result = await pool.query(query, [questionText, questionId, userId]);
    return result.rows[0];
  }

  static async delete({ questionId, userId }) {
    const query = `
      DELETE FROM questions
      USING products
      WHERE questions.product_id = products.id
      AND questions.id = $1 
      AND (questions.user_id = $2 OR products.seller_id = $2)
      RETURNING questions.id
    `;

    const result = await pool.query(query, [questionId, userId]);
    return result.rows[0];
  }

  // New helper to check product ownership context
  static async getProductOwner(questionId) {
    const query = `
      SELECT p.seller_id 
      FROM questions q
      JOIN products p ON q.product_id = p.id
      WHERE q.id = $1
    `;
    const result = await pool.query(query, [questionId]);
    return result.rows[0];
  }

  static async findById(questionId) {
    const query = `SELECT * FROM questions WHERE id = $1`;
    const result = await pool.query(query, [questionId]);
    return result.rows[0];
  }

  static async findAllByProduct(productId) {
    const query = `
      SELECT id, product_id as "productId", user_id as "userId",
             question_text as "questionText",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM questions
      WHERE product_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  }
}

export default Question;
