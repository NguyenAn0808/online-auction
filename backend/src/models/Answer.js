import pool from "../config/database.js";

class Answer {
  static async createTable() {
    try {
      // Create table
      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS answers (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                question_id UUID NOT NULL REFERENCES questions(id) on DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                answer_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

      await pool.query(createTableQuery);

      // Create indexes (ignore if they already exist)
      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at)"
        );
      } catch (err) {}

      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id)"
        );
      } catch (err) {}
      try {
        await pool.query(
          "CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id)"
        );
      } catch (err) {}
      console.log("Answers table ready");
    } catch (error) {
      if (error.code === "23505" || error.code === "42P07") {
        console.log("Answers table already exists");
        return;
      }
      console.error("Error creating questions table:", error);
      throw error;
    }
  }

  static async create({ userId, answerText, questionId }) {
    const query = `
    INSERT INTO answers (user_id, answer_text, question_id)
    VALUES ($1, $2, $3)
    RETURNING id, user_id as "userId",
    answer_text as "answerText", question_id as "questionId",
    created_at as "createdAt", updated_at as "updatedAt"`;
    const values = [userId, answerText, questionId];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23503") {
        console.error("Foreign key constraint violation:", error);
      } else {
        console.error("Error creating Answer:", error);
      }
      throw error;
    }
  }

  static async update({ answerId, userId, answerText }) {
    const query = `
      UPDATE answers
      SET answer_text = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [answerText, answerId, userId]);
    return result.rows[0];
  }

  static async delete({ answerId, userId }) {
    const query = `
      DELETE FROM answers
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [answerId, userId]);
    return result.rows[0];
  }

  static async findById(answerId) {
    const query = `
      SELECT id, user_id as "userId",
             answer_text as "answerText", question_id as "questionId",
                created_at as "createdAt", updated_at as "updatedAt"
        FROM answers
        WHERE id = $1
    `;
    const result = await pool.query(query, [answerId]);
    return result.rows[0];
  }

  static async findAllByQuestion(questionId) {
    const query = `
      SELECT a.id, a.user_id as "userId", u.full_name as "userName", -- Fetch name here
             a.answer_text as "answerText", a.created_at as "createdAt"
      FROM answers a
      JOIN users u ON a.user_id = u.id  -- Join with Users table
      WHERE a.question_id = $1
      ORDER BY a.created_at ASC
    `;
    const result = await pool.query(query, [questionId]);
    return result.rows;
  }
}

export default Answer;
