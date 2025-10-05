const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

class Order {
  constructor(orderData) {
    this.userId = orderData.userId ? new ObjectId(orderData.userId) : null;
    this.orderNumber = orderData.orderNumber;
    this.items = orderData.items || [];
    this.totalAmount = orderData.totalAmount || 0;
    this.status = orderData.status || "pending";
    this.shippingAddress = orderData.shippingAddress || {};
    this.billingAddress = orderData.billingAddress || {};
    this.paymentMethod = orderData.paymentMethod || "";
    this.paymentStatus = orderData.paymentStatus || "pending";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(orderData) {
    const db = getDB();

    // Generate order number
    const orderCount = await db.collection("orders").countDocuments();
    orderData.orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    const result = await db
      .collection("orders")
      .insertOne(new Order(orderData));
    return { _id: result.insertedId, ...orderData };
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection("orders").findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId, limit = 10, skip = 0) {
    const db = getDB();
    return await db
      .collection("orders")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async updateStatus(id, status) {
    const db = getDB();
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );
    return result;
  }

  static async updatePaymentStatus(id, paymentStatus) {
    const db = getDB();
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentStatus,
          updatedAt: new Date(),
        },
      }
    );
    return result;
  }

  static async findAll(filters = {}, limit = 50, skip = 0) {
    const db = getDB();
    return await db
      .collection("orders")
      .find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }
}

module.exports = Order;
