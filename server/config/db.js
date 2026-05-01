import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/silent";

const connectDB = async () => {
  try {
    // If already connected (1) or connecting (2), skip and return
    if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
    ) {
      if (mongoose.connection.db?.databaseName === "test") {
        console.error(
          '[Database] CRITICAL: Currently connected to "test" instead of "silent".',
        );
        console.error(
          "[Database] Action required: Restart your server terminal.",
        );
      }
      return mongoose;
    }

    const uri = process.env.MONGO_URI;

    if (!uri && process.env.NODE_ENV === "production") {
      throw new Error(
        "MONGO_URI is missing in production. Please set it in your environment variables.",
      );
    }

    await mongoose.connect(uri || DEFAULT_MONGO_URI, {
      dbName: "silent",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    const { host, name } = mongoose.connection;
    console.log(
      `MongoDB Connected: ${host || "Atlas Cluster"}/${name || "silent"}`,
    );

    return mongoose;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return null;
  }
};

export default connectDB;
