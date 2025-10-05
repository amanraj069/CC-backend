const { MongoClient } = require("mongodb");

let db = null;
let client = null;

const connectDB = async () => {
  if (db) {
    return db;
  }

  try {
    const uri = process.env.DB_URL;
    if (!uri) {
      throw new Error("DB_URL environment variable is required");
    }

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db("shoppingCart");
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
};
