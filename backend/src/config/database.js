import pkg from "pg";
import config from "./settings.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Database connection successful");
    console.log(`Database time: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
};

export const closePool = async () => {
  try {
    await pool.end();
    console.log("Database pool closed");
  } catch (error) {
    console.error("Error closing database pool:", error);
  }
};

export default pool;
