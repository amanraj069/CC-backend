const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

class User {
  constructor(userData) {
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.role = userData.role || "customer"; // 'customer' or 'admin'
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(userData) {
    const db = getDB();
    const result = await db.collection("users").insertOne(new User(userData));
    return { _id: result.insertedId, ...userData };
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection("users").findOne({ email });
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection("users").findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return result;
  }
}

module.exports = User;
