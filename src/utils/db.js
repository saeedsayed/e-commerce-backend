import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("Already connected to MongoDB 👍");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");

    const db = await mongoose.connect(process.env.MONGO_DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;

    console.log("MongoDB connected 👍");
  } catch (err) {
    isConnected = false;
    console.error("MongoDB connection error ❌", err);
  }
};