const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database connection
const { connectDB } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://main.d2m5w3xifxopy4.amplifyapp.com",
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // For production, be more permissive
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Session-ID",
      "X-Requested-With",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,X-Session-ID,X-Requested-With"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize database connection
let dbConnected = false;

const initializeDB = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
      // Don't throw error, just log it
      dbConnected = false;
    }
  }
};

// Middleware to ensure DB connection (but don't fail if DB is down)
app.use(async (req, res, next) => {
  if (!dbConnected) {
    await initializeDB();
  }

  // Set CORS headers for all responses
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Session-ID,X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  next();
});

// Health route (works without DB)
app.get("/health", (req, res) => {
  console.log(
    "Health check requested from:",
    req.get("origin") || req.get("host")
  );
  res.json({
    success: true,
    data: "Shopping Cart Backend is running properly",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Shopping Cart Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Export the handler for Lambda
module.exports.handler = serverless(app);

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 9000;

  const startServer = async () => {
    await initializeDB();

    app.listen(PORT, () => {
      console.log(`🚀 Shopping Cart Backend running on port ${PORT}`);
      console.log(`📱 Health endpoint: http://localhost:${PORT}/health`);
      console.log(`🛍️  API endpoints: http://localhost:${PORT}/api`);
      console.log(
        `🗄️  Database: ${dbConnected ? "✅ Connected" : "❌ Disconnected"}`
      );
    });
  };

  startServer().catch(console.error);
}
