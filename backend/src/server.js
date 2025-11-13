import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import config from "./config/settings.js";
import cookieParser from "cookie-parser";
import pool, { testConnection, closePool } from "./config/database.js";
import swaggerSpec from "./config/swagger.js";
import authRoute from "./routes/authRoute.js";
import User from "./models/User.js";
import Session from "./models/Session.js";

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: [config.CLIENT_URL].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Session-ID",
      "x-session-id",
    ],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.status(200).json({
      status: "ok",
      environment: config.nodeEnv,
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Online Auction API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Online Auction API Documentation",
  })
);

// API Public Routes
app.use("/api/auth", authRoute);

// API Private Routes

const startServer = async () => {
  try {
    await testConnection();

    // Initialize database tables (like Mongoose schema initialization)
    await User.createTable();
    await Session.createTable();

    console.log("Database tables initialized");

    // Start listening
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${config.port}/health`);
      console.log(
        `API Documentation: http://localhost:${config.port}/api-docs`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await closePool();
  process.exit(0);
});

export { app, pool };
