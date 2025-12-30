import pool from "../config/database.js";

export const initProductDescriptionsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS product_descriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL,
      content TEXT NOT NULL,
      author_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_product_descriptions_product_id
      ON product_descriptions(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_descriptions_created_at
      ON product_descriptions(created_at);
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Product descriptions table initialized");
    return true;
  } catch (error) {
    console.error("Error initializing product descriptions table:", error.message);
    throw error;
  }
};

class ProductDescriptionModel {
  /**
   * Get all appended descriptions for a product (ordered by date)
   * @param {string} product_id - Product UUID
   * @returns {Promise<Array>} Array of description entries
   */
  static async findByProductId(product_id) {
    const query = `
      SELECT
        pd.id,
        pd.product_id,
        pd.content,
        pd.author_id,
        pd.created_at,
        u.full_name as author_name
      FROM product_descriptions pd
      LEFT JOIN users u ON pd.author_id = u.id
      WHERE pd.product_id = $1
      ORDER BY pd.created_at ASC
    `;

    const result = await pool.query(query, [product_id]);
    return result.rows;
  }

  /**
   * Create a new description entry (append)
   * @param {Object} data - Description data
   * @param {string} data.product_id - Product UUID
   * @param {string} data.content - HTML content
   * @param {string} data.author_id - Author UUID
   * @returns {Promise<Object>} Created description entry
   */
  static async create({ product_id, content, author_id }) {
    const query = `
      INSERT INTO product_descriptions (product_id, content, author_id)
      VALUES ($1, $2, $3)
      RETURNING id, product_id, content, author_id, created_at
    `;

    const result = await pool.query(query, [product_id, content, author_id]);
    return result.rows[0];
  }

  /**
   * Get a single description by ID
   * @param {string} id - Description UUID
   * @returns {Promise<Object>} Description entry
   */
  static async findById(id) {
    const query = `
      SELECT
        pd.id,
        pd.product_id,
        pd.content,
        pd.author_id,
        pd.created_at,
        u.full_name as author_name
      FROM product_descriptions pd
      LEFT JOIN users u ON pd.author_id = u.id
      WHERE pd.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Delete a description entry (admin only)
   * @param {string} id - Description UUID
   * @returns {Promise<Object>} Deleted entry
   */
  static async delete(id) {
    const query = "DELETE FROM product_descriptions WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Count descriptions for a product
   * @param {string} product_id - Product UUID
   * @returns {Promise<number>} Count of descriptions
   */
  static async countByProductId(product_id) {
    const query = "SELECT COUNT(*) as count FROM product_descriptions WHERE product_id = $1";
    const result = await pool.query(query, [product_id]);
    return parseInt(result.rows[0].count);
  }
}

export default ProductDescriptionModel;
