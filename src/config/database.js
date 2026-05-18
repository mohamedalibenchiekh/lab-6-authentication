// DATABASE CONNECTION
// MongoDB connection using Mongoose

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connection string options
const MONGODB_LOCAL = 'mongodb://localhost:27017/event-manager';
const MONGODB_ATLAS = process.env.MONGODB_URI || MONGODB_LOCAL;

export class Database {
  static async connect() {
    try {
      console.log('🔌 Connecting to MongoDB...');

      // Remove deprecated options for Mongoose v8+
      await mongoose.connect(MONGODB_ATLAS);

      console.log('✅ MongoDB connected successfully!');
      console.log(`📚 Database: ${mongoose.connection.name}`);
      console.log(`🖥️  Host: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Disconnect failed:', error.message);
    }
  }

  static getConnection() {
    return mongoose.connection;
  }

  static getModels() {
    return mongoose.models;
  }
}

export default Database;
