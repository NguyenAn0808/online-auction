import pool from "../config/database.js";

export const initProductImagesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS product_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL,
      image_url TEXT NOT NULL,
      is_thumbnail BOOLEAN DEFAULT false,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_images_is_thumbnail ON product_images(is_thumbnail);
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Product images table initialized");
    return true;
  } catch (error) {
    console.error("Error initializing product images table:", error.message);
    throw error;
  }
};

class ProductImageModel {
  static async findByProductId(product_id) {
    const query = `
      SELECT 
        id,
        product_id,
        image_url,
        is_thumbnail,
        position,
        created_at
      FROM product_images
      WHERE product_id = $1
      ORDER BY position ASC, created_at ASC
    `;

    const result = await pool.query(query, [product_id]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        id,
        product_id,
        image_url,
        is_thumbnail,
        position,
        created_at
      FROM product_images
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findThumbnail(product_id) {
    const query = `
      SELECT 
        id,
        product_id,
        image_url,
        is_thumbnail,
        position,
        created_at
      FROM product_images
      WHERE product_id = $1 AND is_thumbnail = true
      LIMIT 1
    `;

    const result = await pool.query(query, [product_id]);
    return result.rows[0];
  }

  static async create({ product_id, image_url, is_thumbnail, position }) {
    const query = `
      INSERT INTO product_images (product_id, image_url, is_thumbnail, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id, product_id, image_url, is_thumbnail, position, created_at
    `;

    const result = await pool.query(query, [
      product_id,
      image_url,
      is_thumbnail || false,
      position,
    ]);

    return result.rows[0];
  }

  static async update(id, { image_url, is_thumbnail, position }) {
    const fields = [];
    const params = [];
    let paramCount = 0;

    if (image_url !== undefined) {
      paramCount++;
      fields.push(`image_url = $${paramCount}`);
      params.push(image_url);
    }

    if (is_thumbnail !== undefined) {
      paramCount++;
      fields.push(`is_thumbnail = $${paramCount}`);
      params.push(is_thumbnail);
    }

    if (position !== undefined) {
      paramCount++;
      fields.push(`position = $${paramCount}`);
      params.push(position);
    }

    if (fields.length === 0) {
      return null;
    }

    paramCount++;
    params.push(id);

    const query = `
      UPDATE product_images
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, product_id, image_url, is_thumbnail, position, created_at
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM product_images WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async productExists(product_id) {
    const query = "SELECT id FROM products WHERE id = $1";
    const result = await pool.query(query, [product_id]);
    return result.rows.length > 0;
  }

  /**
   * Create product image within a transaction
   * @param {Object} imageData - Image data
   * @param {Object} client - PostgreSQL client from transaction
   * @returns {Promise<Object>} - Created image record
   */
  static async createWithClient(
    { product_id, image_url, is_thumbnail, position },
    client
  ) {
    const query = `
      INSERT INTO product_images (product_id, image_url, is_thumbnail, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id, product_id, image_url, is_thumbnail, position, created_at
    `;

    const result = await client.query(query, [
      product_id,
      image_url,
      is_thumbnail || false,
      position,
    ]);

    return result.rows[0];
  }
}

export default ProductImageModel;
