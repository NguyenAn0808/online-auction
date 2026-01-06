import pool from "../config/database.js";

class OrderMessage {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS order_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id),
        sender_id UUID NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_order_messages_order ON order_messages(order_id);
    `;
    try {
      await pool.query(query);
      console.log("OrderMessages table ready");
    } catch (error) {
      console.error("Error creating order_messages table:", error);
    }
  }

  static async create({ orderId, senderId, message }) {
    const query = `
      INSERT INTO order_messages (order_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, order_id, sender_id, message, created_at
    `;
    const result = await pool.query(query, [orderId, senderId, message]);
    return result.rows[0];
  }

  static async getByOrderId(orderId) {
    const query = `
      SELECT 
        om.id,
        om.order_id,
        om.sender_id,
        om.message,
        om.created_at,
        u.full_name as "sender_name"
      FROM order_messages om
      JOIN users u ON om.sender_id = u.id
      WHERE om.order_id = $1
      ORDER BY om.created_at ASC
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }
}

export default OrderMessage;
