import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    connectionString: process.env.SUPABASE_CONNECTION_STRING,
  },
};

// Validate required env
const requiredEnvVars = ["SUPABASE_CONNECTION_STRING"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
