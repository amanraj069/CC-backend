const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route
app.get("/health", (req, res) => {
  console.log(
    "Health check requested from:",
    req.get("origin") || req.get("host")
  );
  res.json({
    success: true,
    data: "Backend is running properly",
  });
});

// Add a simple root route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running",
    endpoints: ["/health"],
  });
});

// Export the handler for Lambda
module.exports.handler = serverless(app);

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 9000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(
      `Health endpoint available at: http://localhost:${PORT}/health`
    );
  });
}
