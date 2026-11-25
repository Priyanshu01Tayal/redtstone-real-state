const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/redstone_realestate';

    // Attempt standard connection
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      return conn;
    } catch (directErr) {
      console.warn(`[MongoDB] Direct connection to ${mongoUri} failed (${directErr.message}). Launching in-memory MongoDB fallback for testing...`);

      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'redstone_realestate' }
      });
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-memory database connected at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[MongoDB] Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
