const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// All order routes require authentication
router.post("/", auth, createOrder);
router.get("/", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
router.put("/:id/cancel", auth, cancelOrder);

module.exports = router;
