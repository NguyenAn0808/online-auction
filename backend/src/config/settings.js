import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    connectionString: process.env.SUPABASE_CONNECTION_STRING,
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    image_bucket_name:
      process.env.SUPABASE_IMAGE_BUCKET || "online_auction_images",
  },
};

// Validate required env
const requiredEnvVars = [
  "SUPABASE_CONNECTION_STRING",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_IMAGE_BUCKET",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
