const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

// Import routes and middlewares
const urlRoutes = require("./routes/urlRoutes");
const { apiLimiter, shortenLimiter } = require("./middlewares/rateLimiter");
const { logger, errorLogger } = require("./middlewares/logger");
const redisService = require("./services/redisService");
const cacheService = require("./services/cacheService");
const Url = require("./models/Url");

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * ---------------------------
 * Middlewares
 * ---------------------------
 */
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use("/api/", apiLimiter);

/**
 * ---------------------------
 * Routes
 * ---------------------------
 */
app.use("/api/v1/data", shortenLimiter, urlRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/cache/stats", async (req, res) => {
  try {
    const cacheService = require("./services/cacheService");
    const stats = await cacheService.getCacheStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get cache stats",
    });
  }
});

app.get("/api/v1/data/urls", async (req, res) => {
  try {
    const urls = await Url.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching URLs",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "URL Shortener API",
    version: "1.0.0",
    endpoints: {
      shorten: "POST /api/v1/data/shorten",
      analytics: "GET /api/v1/data/analytics/:shortId",
      redirect: "GET /:shortId",
    },
  });
});

app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await cacheService.getUrl(shortId);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    await cacheService.trackHit(shortId);

    try {
      await Url.findOneAndUpdate(
        { shortId },
        { $inc: { hits: 1 } },
        { new: true }
      );
      console.log(`📈 Updated database hits for shortId: ${shortId}`);
    } catch (err) {
      console.error("Error updating database hits:", err);
    }

    return res.redirect(301, url.longUrl);
  } catch (error) {
    console.error("Error redirecting URL:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * ---------------------------
 * Error handlers
 * ---------------------------
 */
app.use(errorLogger);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/**
 * ---------------------------
 * DB + Redis init (Vercel-safe)
 * ---------------------------
 */
let isInitialized = false;

async function initServices() {
  if (isInitialized) return;

  // Mongo
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/urlshortener",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }
  );

  console.log("Connected to MongoDB");

  // Redis
  const redisConnected = await redisService.connect();
  if (redisConnected) console.log("🚀 Redis caching enabled");
  else console.log("⚠️ Redis not available, using database only");

  isInitialized = true;
}

// ✅ On Vercel: init on first request
app.use(async (req, res, next) => {
  try {
    await initServices();
    next();
  } catch (e) {
    console.error("Startup init failed:", e);
    res.status(500).json({ success: false, message: "Startup init failed" });
  }
});

// ✅ Only start server locally
if (require.main === module) {
  initServices()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });

  // Graceful shutdown only for local/server runs
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      process.exit(1);
    }
  });
}

module.exports = app;
