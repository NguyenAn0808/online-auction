import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import config from "./config/settings.js";
import cookieParser from "cookie-parser";
import pool, { testConnection, closePool } from "./config/database.js";
import authRoute from "./routes/authRoute.js";
import User from "./models/User.js";
import Session from "./models/Session.js";
import OTP from "./models/OTP.js";
import "./config/passport.js"; // Initialize passport strategies
import { initCategoriesTable } from "./models/category.model.js";
import { initProductsTable } from "./models/product.model.js";
import { initProductImagesTable } from "./models/product-image.model.js";
import { initWatchlistTable } from "./models/Watchlist.js";
import { initRatingsTable } from "./models/Rating.js";
import { initBidsTable } from "./models/Bid.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import bidRoutes from "./routes/bid.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import orderRoute from "./routes/orderRoute.js";
import Question from "./models/Question.js";
import Answer from "./models/Answer.js";
import questionRoute from "./routes/questionRoute.js";
import answerRoute from "./routes/answerRoute.js";
import userRoutes from "./routes/userRoute.js";
import { initBlockedBiddersTable } from "./models/blocked-bidder.model.js";
import { initProductDescriptionsTable } from "./models/product-description.model.js";
import Order from "./models/Order.js";
import OrderMessage from "./models/OrderMessage.js";
import { initializeCronJobs } from "./jobs/index.js";

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: [config.CLIENT_URL, "http://localhost:5173"].filter(Boolean),
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
app.use(morgan("dev"));
// Session middleware (required for passport)
app.use(
  session({
    secret: config.ACCESS_TOKEN_SECRET, // Use the same secret for simplicity
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

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

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/orders", orderRoute);
app.use("/api", questionRoute);
app.use("/api", answerRoute);

// Swagger UI and JSON
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables (like Mongoose schema initialization)

    console.log("Database tables initialized");
    // Initialize database schema
    console.log("Initializing database schema...");
    await initCategoriesTable();
    await initProductsTable();
    await initProductImagesTable();
    await initProductDescriptionsTable();
    await initWatchlistTable();
    await initRatingsTable();
    await initBidsTable();
    await initBlockedBiddersTable();

    await User.createTable();
    await Session.createTable();
    await OTP.createTable();
    await Question.createTable();
    await Answer.createTable();
    await Order.createTable();
    await OrderMessage.createTable();
    
    // Initialize all CronJobs
    initializeCronJobs();
    
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
