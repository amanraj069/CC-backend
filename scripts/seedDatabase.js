require("dotenv").config();
const { connectDB } = require("../config/database");
const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: 199.99,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    stock: 50,
  },
  {
    name: "Smart Fitness Watch",
    description:
      "Advanced fitness tracker with heart rate monitoring, GPS, and smartphone notifications.",
    price: 299.99,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    stock: 30,
  },
  {
    name: "Organic Cotton T-Shirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt available in multiple colors.",
    price: 29.99,
    category: "Clothing",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    stock: 100,
  },
  {
    name: "Professional Coffee Maker",
    description:
      "Premium coffee maker with programmable brewing and thermal carafe.",
    price: 149.99,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500",
    stock: 25,
  },
  {
    name: "Running Shoes",
    description:
      "Lightweight running shoes with advanced cushioning and breathable mesh upper.",
    price: 129.99,
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    stock: 75,
  },
  {
    name: "Bestselling Novel",
    description:
      "Award-winning fiction novel that has captivated readers worldwide.",
    price: 15.99,
    category: "Books",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
    stock: 200,
  },
  {
    name: "Wireless Phone Charger",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices.",
    price: 39.99,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500",
    stock: 80,
  },
  {
    name: "Denim Jeans",
    description:
      "Classic straight-fit denim jeans made from premium cotton blend.",
    price: 79.99,
    category: "Clothing",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    stock: 60,
  },
  {
    name: "Ceramic Cookware Set",
    description:
      "Non-stick ceramic cookware set including pots, pans, and cooking utensils.",
    price: 199.99,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
    stock: 15,
  },
  {
    name: "Yoga Mat",
    description:
      "Extra-thick yoga mat with non-slip surface and carrying strap.",
    price: 49.99,
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1506629905607-676eed681725?w=500",
    stock: 40,
  },
  {
    name: "Programming Guide",
    description:
      "Comprehensive guide to modern web development with practical examples.",
    price: 39.99,
    category: "Books",
    imageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500",
    stock: 150,
  },
  {
    name: "Bluetooth Speaker",
    description:
      "Portable Bluetooth speaker with 360-degree sound and waterproof design.",
    price: 89.99,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    stock: 45,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing products
    const db = require("../config/database").getDB();
    await db.collection("products").deleteMany({});
    console.log("Cleared existing products");

    // Insert sample products
    for (const productData of sampleProducts) {
      await Product.create(productData);
      console.log(`Created product: ${productData.name}`);
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;
