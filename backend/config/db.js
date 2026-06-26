const mongoose = require('mongoose');

const mongoConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

// Simple in-memory cache (Redis replacement)
class MemoryCache {
  constructor() {
    this.store = new Map();
  }
  async set(key, value, ttlSeconds = 300) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }
  async del(key) {
    this.store.delete(key);
  }
}

const cache = new MemoryCache();

module.exports = { mongoConnect, cache };
