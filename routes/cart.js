const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// All cart routes support both authenticated and anonymous users
router.get("/", optionalAuth, getCart);
router.post("/items", optionalAuth, addToCart);
router.put("/items/:productId", optionalAuth, updateCartItem);
router.delete("/items/:productId", optionalAuth, removeFromCart);
router.delete("/", optionalAuth, clearCart);

module.exports = router;
