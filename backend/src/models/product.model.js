import pool from "../config/database.js";

export const initProductsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID NOT NULL,
      category_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      start_price DECIMAL(10, 2) NOT NULL,
      step_price DECIMAL(10, 2) NOT NULL,
      buy_now_price DECIMAL(10, 2),
      start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'deleted')),
      specifications JSONB DEFAULT '[]'::jsonb,
      allow_unrated_bidder BOOLEAN DEFAULT true,
      auto_extend BOOLEAN NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_end_time ON products(end_time);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Products table initialized");
    return true;
  } catch (error) {
    console.error("Error initializing products table:", error.message);
    throw error;
  }
};

class ProductModel {
  static async findAll({
    category_id,
    search,
    sort = "newest",
    new_only,
    page = 1,
    limit = 10,
  }) {
    let query = `
      SELECT 
        p.id,
        p.seller_id,
        p.category_id,
        p.name,
        p.description,
        p.start_price,
        p.step_price,
        p.buy_now_price,
        p.start_time,
        p.end_time,
        p.status,
        p.allow_unrated_bidder,
        p.auto_extend,
        p.specifications,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        pi.image_url as thumbnail
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_thumbnail = true
      WHERE p.status = 'active'
    `;

    const params = [];
    let paramCount = 0;

    if (category_id) {
      // Check if the category is a parent category (parent_id is null)
      const categoryCheckQuery = `
        SELECT parent_id FROM categories WHERE id = $1
      `;
      const categoryResult = await pool.query(categoryCheckQuery, [
        category_id,
      ]);

      if (categoryResult.rows.length > 0) {
        const category = categoryResult.rows[0];

        if (category.parent_id === null) {
          // Parent category: get products from this category and all its children
          const childCategoriesQuery = `
            SELECT id FROM categories WHERE parent_id = $1
          `;
          const childCategoriesResult = await pool.query(childCategoriesQuery, [
            category_id,
          ]);
          const childCategoryIds = childCategoriesResult.rows.map(
            (row) => row.id
          );

          // Build the condition with all category IDs (parent + children)
          const allCategoryIds = [category_id, ...childCategoryIds];
          paramCount++;
          query += ` AND p.category_id = ANY($${paramCount}::uuid[])`;
          params.push(allCategoryIds);
        } else {
          // Child category: only get products from this specific category
          paramCount++;
          query += ` AND p.category_id = $${paramCount}`;
          params.push(category_id);
        }
      }
    }

    // Text search
    if (search) {
      paramCount++;
      const searchParam1 = paramCount;
      paramCount++;
      query += ` AND (p.name ILIKE $${searchParam1} OR c.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    // New items only (e.g., posted in last 60 minutes)
    if (new_only) {
      query += ` AND p.created_at >= NOW() - INTERVAL '60 minutes'`;
    }

    // Sorting
    switch (sort) {
      case "end_time_desc":
        query += ` ORDER BY p.end_time ASC`;
        break;
      case "price_asc":
        query += ` ORDER BY p.start_price ASC`;
        break;
      case "price_desc":
        query += ` ORDER BY p.start_price DESC`;
        break;
      case "newest":
      default:
        query += ` ORDER BY p.created_at DESC`;
        break;
    }

    // Count total for pagination
    const countQuery = query.replace(
      /SELECT .+ FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    return {
      items: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    };
  }

  static async findById(id) {
    const query = `
      SELECT 
        p.id,
        p.seller_id,
        p.category_id,
        p.name,
        p.description,
        p.start_price,
        p.step_price,
        p.buy_now_price,
        p.start_time,
        p.end_time,
        p.status,
        p.allow_unrated_bidder,
        p.auto_extend,
        p.specifications,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        pi.image_url as thumbnail
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_thumbnail = true
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(productData) {
    const {
      seller_id,
      category_id,
      name,
      description,
      start_price,
      step_price,
      buy_now_price,
      start_time,
      end_time,
      allow_unrated_bidder,
      auto_extend,
      specifications,
    } = productData;

    const query = `
      INSERT INTO products (
        seller_id,
        category_id,
        name,
        description,
        start_price,
        step_price,
        buy_now_price,
        start_time,
        end_time,
        allow_unrated_bidder,
        auto_extend,
        specifications
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      seller_id,
      category_id,
      name,
      description,
      start_price,
      step_price,
      buy_now_price || null,
      start_time || new Date(),
      end_time,
      allow_unrated_bidder !== undefined ? allow_unrated_bidder : true,
      auto_extend,
      specifications || [],
    ]);

    return result.rows[0];
  }

  static async update(id, productData) {
    const fields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = [
      "name",
      "description",
      "start_price",
      "step_price",
      "buy_now_price",
      "end_time",
      "status",
      "allow_unrated_bidder",
      "auto_extend",
      "specifications",
    ];

    allowedFields.forEach((field) => {
      if (productData[field] !== undefined) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        params.push(productData[field]);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    paramCount++;
    fields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      UPDATE products
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Create product within a transaction
   * @param {Object} productData - Product data
   * @param {Object} client - PostgreSQL client from transaction
   * @returns {Promise<Object>} - Created product
   */
  static async createWithClient(productData, client) {
    const {
      seller_id,
      category_id,
      name,
      description,
      start_price,
      step_price,
      buy_now_price,
      start_time,
      end_time,
      allow_unrated_bidder,
      auto_extend,
      specifications,
    } = productData;

    const query = `
      INSERT INTO products (
        seller_id,
        category_id,
        name,
        description,
        start_price,
        step_price,
        buy_now_price,
        start_time,
        end_time,
        allow_unrated_bidder,
        auto_extend,
        specifications
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await client.query(query, [
      seller_id,
      category_id,
      name,
      description,
      start_price,
      step_price,
      buy_now_price || null,
      start_time || new Date(),
      end_time,
      allow_unrated_bidder !== undefined ? allow_unrated_bidder : true,
      auto_extend,
      specifications || [],
    ]);

    return result.rows[0];
  }

  /**
   * Delete product within a transaction (hard delete for rollback scenarios)
   * @param {string} id - Product UUID
   * @param {Object} client - PostgreSQL client from transaction
   */
  static async deleteWithClient(id, client) {
    const query = `DELETE FROM products WHERE id = $1`;
    await client.query(query, [id]);
  }
}

export default ProductModel;
