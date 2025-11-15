import pool from "../config/database.js";

// Initialize categories table schema
export const initCategoriesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      parent_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Categories table initialized");
    return true;
  } catch (error) {
    console.error("Error initializing categories table:", error.message);
    throw error;
  }
};

class CategoryModel {
  // Get all categories
  static async findAll() {
    const query = `
      SELECT 
        id,
        name,
        parent_id,
        created_at,
        updated_at
      FROM categories
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get category by ID
  static async findById(id) {
    const query = `
      SELECT 
        id,
        name,
        parent_id,
        created_at,
        updated_at
      FROM categories
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new category
  static async create({ name, parent_id = null }) {
    const query = `
      INSERT INTO categories (name, parent_id)
      VALUES ($1, $2)
      RETURNING id, name, parent_id, created_at, updated_at
    `;

    const result = await pool.query(query, [name, parent_id]);
    return result.rows[0];
  }

  // Update category
  static async update(id, { name, parent_id }) {
    const query = `
      UPDATE categories
      SET 
        name = COALESCE($1, name),
        parent_id = COALESCE($2, parent_id),
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, parent_id, created_at, updated_at
    `;

    const result = await pool.query(query, [name, parent_id, id]);
    return result.rows[0];
  }

  // Delete category
  static async delete(id) {
    const query = "DELETE FROM categories WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Check if category exists by name
  static async existsByName(name) {
    const query = "SELECT id FROM categories WHERE name = $1";
    const result = await pool.query(query, [name]);
    return result.rows.length > 0;
  }
}

export default CategoryModel;
