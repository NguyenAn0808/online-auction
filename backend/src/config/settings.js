import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:8000",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
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
