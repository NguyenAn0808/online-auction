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
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
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
