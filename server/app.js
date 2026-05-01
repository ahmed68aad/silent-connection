import connectDB from "./config/db.js";
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import PostRouter from "./routes/postRoute.js";
import UserRouter from "./routes/userRoute.js";
import CoupleRouter from "./routes/coupleRoute.js";
import GroupRouter from "./routes/groupRoute.js";
import { errorHandler, notFound } from "./middleWares/errorHandler.js";
import { uploadsRoot } from "./config/multer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable("x-powered-by");

// ✅ CORS لازم يبقى أول حاجة
const configuredOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://silent-connection-cli.vercel.app",
  ...configuredOrigins,
]);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, "");
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "X-Session-Id"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

// ✅ body parser
app.use(express.json({ limit: "1mb" }));

// ✅ static files
app.use("/uploads", express.static(uploadsRoot));

// ✅ health routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Silent Connection API",
    status: "ok",
    health: "/api/health",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    const dbName = mongoose.connection.db?.databaseName;

    if (dbName === "test") {
      console.warn(
        '[Database] ALERT: Application is connected to "test" database.',
      );
    } else {
      console.log(`[Database] Connected to: "${dbName}"`);
    }

    res.json({
      success: true,
      database: dbName || null,
      isCorrectDatabase: dbName === "silent",
      readyState: mongoose.connection.readyState,
      mongoUriExists: Boolean(process.env.MONGO_URI),
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database health check failed",
      error: error.message,
    });
  }
});

// ✅ routes
app.use("/api/posts", PostRouter);
app.use("/api/users", UserRouter);
app.use("/api/couples", CoupleRouter);
app.use("/api/groups", GroupRouter);

// ✅ errors
app.use(notFound);
app.use(errorHandler);

export default app;
