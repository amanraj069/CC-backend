const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");

const getCart = async (req, res) => {
  try {
    let cart = null;

    if (req.user) {
      // User is authenticated
      cart = await Cart.findByUserId(req.user._id);
    } else {
      // Anonymous user
      const sessionId = req.header("X-Session-ID");
      if (sessionId) {
        cart = await Cart.findBySessionId(sessionId);
      }
    }

    if (!cart) {
      // Create new cart
      const cartData = {
        userId: req.user ? req.user._id : null,
        sessionId: req.user ? null : req.header("X-Session-ID") || uuidv4(),
        items: [],
        totalAmount: 0,
      };

      cart = await Cart.create(cartData);
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const addItemSchema = Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).default(1),
    });

    const { error } = addItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { productId, quantity } = req.body;

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Get or create cart
    let cart = null;

    if (req.user) {
      cart = await Cart.findByUserId(req.user._id);
    } else {
      const sessionId = req.header("X-Session-ID");
      if (sessionId) {
        cart = await Cart.findBySessionId(sessionId);
      }
    }

    if (!cart) {
      const cartData = {
        userId: req.user ? req.user._id : null,
        sessionId: req.user ? null : req.header("X-Session-ID") || uuidv4(),
        items: [],
        totalAmount: 0,
      };

      cart = await Cart.create(cartData);
    }

    // Add item to cart
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    };

    await Cart.addItem(cart._id, cartItem);

    // Get updated cart
    const updatedCart = req.user
      ? await Cart.findByUserId(req.user._id)
      : await Cart.findBySessionId(req.header("X-Session-ID"));

    res.json({
      success: true,
      message: "Item added to cart",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const updateItemSchema = Joi.object({
      quantity: Joi.number().integer().min(0).required(),
    });

    const { error } = updateItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    // Get cart
    let cart = null;

    if (req.user) {
      cart = await Cart.findByUserId(req.user._id);
    } else {
      const sessionId = req.header("X-Session-ID");
      if (sessionId) {
        cart = await Cart.findBySessionId(sessionId);
      }
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Update item quantity
    await Cart.updateItemQuantity(cart._id, productId, quantity);

    // Get updated cart
    const updatedCart = req.user
      ? await Cart.findByUserId(req.user._id)
      : await Cart.findBySessionId(req.header("X-Session-ID"));

    res.json({
      success: true,
      message: "Cart item updated",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get cart
    let cart = null;

    if (req.user) {
      cart = await Cart.findByUserId(req.user._id);
    } else {
      const sessionId = req.header("X-Session-ID");
      if (sessionId) {
        cart = await Cart.findBySessionId(sessionId);
      }
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove item from cart
    await Cart.removeItem(cart._id, productId);

    // Get updated cart
    const updatedCart = req.user
      ? await Cart.findByUserId(req.user._id)
      : await Cart.findBySessionId(req.header("X-Session-ID"));

    res.json({
      success: true,
      message: "Item removed from cart",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    // Get cart
    let cart = null;

    if (req.user) {
      cart = await Cart.findByUserId(req.user._id);
    } else {
      const sessionId = req.header("X-Session-ID");
      if (sessionId) {
        cart = await Cart.findBySessionId(sessionId);
      }
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear cart
    await Cart.clearCart(cart._id);

    // Get updated cart
    const updatedCart = req.user
      ? await Cart.findByUserId(req.user._id)
      : await Cart.findBySessionId(req.header("X-Session-ID"));

    res.json({
      success: true,
      message: "Cart cleared",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
