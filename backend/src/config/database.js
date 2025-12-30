import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");
import pkg from "pg";
import config from "./settings.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  // Force IPv4 to avoid IPv6 timeout issues
  host: undefined, // Let connection string handle host
  connectionTimeoutMillis: 10000, // 10 seconds timeout
  idleTimeoutMillis: 30000,
  max: 20, // Maximum pool size
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

/**
 * Execute a function within a database transaction
 * @param {Function} fn - Function receiving a client that returns a promise
 * @returns {Promise<any>} - Result of the function
 */
export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
