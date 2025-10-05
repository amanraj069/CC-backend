const express = require("express");
const {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { auth } = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Admin routes (protected)
router.post("/", auth, adminAuth, createProduct);
router.put("/:id", auth, adminAuth, updateProduct);
router.delete("/:id", auth, adminAuth, deleteProduct);

module.exports = router;
