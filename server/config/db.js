import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/silent";

let cachedConnection = null;

const connectDB = async () => {
  try {
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    const uri = process.env.MONGO_URI;

    if (!uri && process.env.NODE_ENV === "production") {
      throw new Error(
        "MONGO_URI is missing in production. Please set it in the Vercel dashboard.",
      );
    }

    cachedConnection = await mongoose.connect(uri || DEFAULT_MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(
      `MongoDB Connected: ${cachedConnection.connection.host}/${cachedConnection.connection.name}`,
    );

    return cachedConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    cachedConnection = null;
    return null;
  }
};

export default connectDB;
