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
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://main.d2m5w3xifxopy4.amplifyapp.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-ID"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
    }
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await initializeDB();
  next();
});

// Health route
app.get("/health", (req, res) => {
  console.log(
    "Health check requested from:",
    req.get("origin") || req.get("host")
  );
  res.json({
    success: true,
    data: "Shopping Cart Backend is running properly",
    database: dbConnected ? "connected" : "disconnected",
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
