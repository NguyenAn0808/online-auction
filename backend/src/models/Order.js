import pool from "../config/database.js";

class Order {
  static async createTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES products(id),
        buyer_id UUID NOT NULL REFERENCES users(id), -- The Winner
        seller_id UUID NOT NULL REFERENCES users(id), -- The Product Owner
        final_price DECIMAL(12, 2) NOT NULL,
        payment_proof_image TEXT NOT NULL, -- URL to the image,
        shipping_address TEXT NOT NULL,
        shipping_proof_image TEXT, -- URL to the image (nullable until seller confirms shipping)
        shipping_code TEXT,
        cancel_reason TEXT,
        status VARCHAR(20) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'delivering', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id) -- One order per product
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    `;
    try {
      await pool.query(query);
      console.log("Orders table ready");
    } catch (error) {
      console.error("Error creating orders table:", error);
    }
  }

  static async create({
    productId,
    buyerId,
    sellerId,
    finalPrice,
    proofImage,
    address,
  }) {
    const query = `
    INSERT INTO orders (product_id, buyer_id, seller_id, final_price, payment_proof_image, shipping_address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      productId,
      buyerId,
      sellerId,
      finalPrice,
      proofImage,
      address,
    ]);
    return result.rows[0];
  }

  static async findByProduct(productId) {
    const query = `SELECT * FROM orders WHERE product_id = $1`;
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  }

  static async findById(orderId) {
    const query = `SELECT * FROM orders WHERE id = $1`;
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }

  static async getOrdersByWinner(buyerId) {
    const query = `
      SELECT o.*, p.name as product_name, p.end_time 
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [buyerId]);
    return result.rows;
  }

  static async markAsDelivering(orderId, shippingCode, shippingImage) {
    const query = `
      UPDATE orders 
      SET 
        status = 'delivering', 
        shipping_code = $1, 
        shipping_proof_image = $2, -- Save the image URL
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [
      shippingCode,
      shippingImage,
      orderId,
    ]);
    return result.rows[0];
  }

  static async markAsCompleted(orderId) {
    const query = `
      UPDATE orders 
      SET 
        status = 'completed', 
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }

  static async cancel(orderId, reason) {
    const query = `
      UPDATE orders 
      SET 
        status = 'cancelled', 
        cancel_reason = $1, 
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [reason, orderId]);
    return result.rows[0];
  }
}

export default Order;
