import express from "express";
import config from "./config/settings.js";
import pool, { testConnection, closePool } from "./config/database.js";
import { initCategoriesTable } from "./models/category.model.js";
import { initProductsTable } from "./models/product.model.js";
import { initProductImagesTable } from "./models/product-image.model.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

// Middleware
app.use(express.json());
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
  });
});

// API Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Swagger UI and JSON
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database schema
    console.log("Initializing database schema...");
    await initCategoriesTable();
    await initProductsTable();
    await initProductImagesTable();

    // Start listening
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${config.port}/health`);
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
