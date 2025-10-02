const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import routes and middlewares
const urlRoutes = require('./routes/urlRoutes');
const { apiLimiter, shortenLimiter } = require('./middlewares/rateLimiter');
const { logger, errorLogger } = require('./middlewares/logger');
const redisService = require('./services/redisService');
const cacheService = require('./services/cacheService');
const Url = require('./models/Url');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logger);

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/v1/data', shortenLimiter, urlRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Cache statistics endpoint
app.get('/cache/stats', async (req, res) => {
  try {
    const cacheService = require('./services/cacheService');
    const stats = await cacheService.getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats'
    });
  }
});

// Get all URLs with hit counts
app.get('/api/v1/data/urls', async (req, res) => {
  try {
    const urls = await Url.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: urls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching URLs'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      shorten: 'POST /api/v1/data/shorten',
      analytics: 'GET /api/v1/data/analytics/:shortId',
      redirect: 'GET /:shortId'
    }
  });
});

// Handle redirects for short URLs
app.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    
    // Try to get URL from cache first
    const url = await cacheService.getUrl(shortId);
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found'
      });
    }
    
    // Track hit in Redis for real-time analytics
    await cacheService.trackHit(shortId);
    
    // Update hit counter in database (always update, regardless of cache)
    try {
      await Url.findOneAndUpdate(
        { shortId },
        { $inc: { hits: 1 } },
        { new: true }
      );
      console.log(`📈 Updated database hits for shortId: ${shortId}`);
    } catch (err) {
      console.error('Error updating database hits:', err);
    }
    
    // Redirect to original URL
    res.redirect(301, url.longUrl);
    
  } catch (error) {
    console.error('Error redirecting URL:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Initialize Redis connection
  const redisConnected = await redisService.connect();
  if (redisConnected) {
    console.log('🚀 Redis caching enabled');
  } else {
    console.log('⚠️ Redis not available, using database only');
  }
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = app;
