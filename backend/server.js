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
 * DB + Redis init (MUST be before routes)
 * ---------------------------
 */
mongoose.set("bufferCommands", false);

let isInitialized = false;
let initPromise = null;

async function initServices() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Mongo
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // ✅ more tolerant on serverless
      socketTimeoutMS: 45000,
    });

    console.log("Connected to MongoDB");

    // Redis
    try {
      const redisConnected = await redisService.connect();
      console.log(
        redisConnected
          ? "🚀 Redis caching enabled"
          : "⚠️ Redis not available, using database only"
      );
    } catch (e) {
      console.error("Redis init failed (continuing without redis):", e.message);
    }

    isInitialized = true;
  })();

  return initPromise;
}

// ✅ Ensure DB/Redis initialized before any request hits routes
app.use(async (req, res, next) => {
  try {
    await initServices();
    next();
  } catch (e) {
    console.error("Database init failed:", e);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

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

// ✅ Debug endpoint to confirm Mongo is connected (1 = connected)
app.get("/db-test", (req, res) => {
  res.json({ success: true, readyState: mongoose.connection.readyState });
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

// Handle redirects for short URLs
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
 * Local start only
 * ---------------------------
 */
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
