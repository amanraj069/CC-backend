const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health endpoint available at: http://localhost:${PORT}/health`);
});
