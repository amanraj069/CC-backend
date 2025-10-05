const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

class Cart {
  constructor(cartData) {
    this.userId = cartData.userId ? new ObjectId(cartData.userId) : null;
    this.sessionId = cartData.sessionId || null;
    this.items = cartData.items || [];
    this.totalAmount = cartData.totalAmount || 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours TTL
  }

  static async create(cartData) {
    const db = getDB();
    const result = await db.collection("carts").insertOne(new Cart(cartData));
    return { _id: result.insertedId, ...cartData };
  }

  static async findByUserId(userId) {
    const db = getDB();
    return await db.collection("carts").findOne({
      userId: new ObjectId(userId),
      expiresAt: { $gt: new Date() },
    });
  }

  static async findBySessionId(sessionId) {
    const db = getDB();
    return await db.collection("carts").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    });
  }

  static async updateCart(cartId, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    updateData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await db
      .collection("carts")
      .updateOne({ _id: new ObjectId(cartId) }, { $set: updateData });
    return result;
  }

  static async addItem(cartId, item) {
    const db = getDB();
    const cart = await db
      .collection("carts")
      .findOne({ _id: new ObjectId(cartId) });

    if (!cart) return null;

    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.productId.toString() === item.productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      cart.items.push({
        productId: new ObjectId(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce(
      (total, cartItem) => total + cartItem.price * cartItem.quantity,
      0
    );

    const result = await this.updateCart(cartId, {
      items: cart.items,
      totalAmount: cart.totalAmount,
    });

    return result;
  }

  static async removeItem(cartId, productId) {
    const db = getDB();
    const cart = await db
      .collection("carts")
      .findOne({ _id: new ObjectId(cartId) });

    if (!cart) return null;

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Recalculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const result = await this.updateCart(cartId, {
      items: cart.items,
      totalAmount: cart.totalAmount,
    });

    return result;
  }

  static async updateItemQuantity(cartId, productId, quantity) {
    const db = getDB();
    const cart = await db
      .collection("carts")
      .findOne({ _id: new ObjectId(cartId) });

    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) return null;

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const result = await this.updateCart(cartId, {
      items: cart.items,
      totalAmount: cart.totalAmount,
    });

    return result;
  }

  static async clearCart(cartId) {
    const db = getDB();
    const result = await this.updateCart(cartId, {
      items: [],
      totalAmount: 0,
    });
    return result;
  }

  static async deleteExpiredCarts() {
    const db = getDB();
    const result = await db.collection("carts").deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result;
  }
}

module.exports = Cart;
