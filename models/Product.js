const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

class Product {
  constructor(productData) {
    this.name = productData.name;
    this.description = productData.description;
    this.price = productData.price;
    this.category = productData.category;
    this.imageUrl = productData.imageUrl;
    this.stock = productData.stock || 0;
    this.isActive =
      productData.isActive !== undefined ? productData.isActive : true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(productData) {
    const db = getDB();
    const result = await db
      .collection("products")
      .insertOne(new Product(productData));
    return { _id: result.insertedId, ...productData };
  }

  static async findAll(filters = {}) {
    const db = getDB();
    const query = { isActive: true, ...filters };
    return await db.collection("products").find(query).toArray();
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection("products").findOne({
      _id: new ObjectId(id),
      isActive: true,
    });
  }

  static async updateStock(id, quantity) {
    const db = getDB();
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { stock: -quantity },
        $set: { updatedAt: new Date() },
      }
    );
    return result;
  }

  static async updateById(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      throw new Error("Product not found");
    }

    return await Product.findById(id);
  }

  static async deleteById(id) {
    const db = getDB();
    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      throw new Error("Product not found");
    }

    return result;
  }

  static async findByCategory(category) {
    const db = getDB();
    return await db
      .collection("products")
      .find({
        category,
        isActive: true,
      })
      .toArray();
  }
}

module.exports = Product;
