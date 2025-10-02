const Url = require('../models/Url');
const redisService = require('./redisService');

// Set Redis Cloud environment variables if not already set
if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = 'redis-14389.c305.ap-south-1-1.ec2.redns.redis-cloud.com';
  process.env.REDIS_PORT = '14389';
  process.env.REDIS_PASSWORD = 'Q4frZuYQAnne8BFi3L2SesF0JWUk0nZW';
  process.env.REDIS_USERNAME = 'default';
}

class CacheService {
  constructor() {
    this.CACHE_TTL = 3600; // 1 hour
    this.URL_PREFIX = 'url:';
    this.HITS_PREFIX = 'hits:';
    this.POPULAR_PREFIX = 'popular:';
  }

  /**
   * Get URL from cache or database
   */
  async getUrl(shortId) {
    try {
      // Try to get from Redis cache first
      const cacheKey = `${this.URL_PREFIX}${shortId}`;
      const cachedUrl = await redisService.get(cacheKey);
      
      if (cachedUrl) {
        console.log(`📦 Cache HIT for shortId: ${shortId}`);
        return cachedUrl;
      }

      // If not in cache, get from database
      console.log(`💾 Cache MISS for shortId: ${shortId}, fetching from database`);
      const url = await Url.findOne({ shortId });
      
      if (url) {
        // Cache the result for future requests
        await redisService.set(cacheKey, url, this.CACHE_TTL);
        console.log(`💾 Cached URL for shortId: ${shortId}`);
      }
      
      return url;
    } catch (error) {
      console.error('Cache service error:', error);
      // Fallback to database if Redis fails
      return await Url.findOne({ shortId });
    }
  }

  /**
   * Cache a URL after creation
   */
  async cacheUrl(url) {
    try {
      const cacheKey = `${this.URL_PREFIX}${url.shortId}`;
      await redisService.set(cacheKey, url, this.CACHE_TTL);
      console.log(`💾 Cached new URL: ${url.shortId}`);
    } catch (error) {
      console.error('Error caching URL:', error);
    }
  }

  /**
   * Invalidate cache for a URL
   */
  async invalidateUrl(shortId) {
    try {
      const cacheKey = `${this.URL_PREFIX}${shortId}`;
      await redisService.del(cacheKey);
      console.log(`🗑️ Invalidated cache for shortId: ${shortId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Track URL hits in Redis
   */
  async trackHit(shortId) {
    try {
      const hitsKey = `${this.HITS_PREFIX}${shortId}`;
      const hitCount = await redisService.incr(hitsKey);
      
      // Set expiration for hits counter (24 hours)
      await redisService.expire(hitsKey, 86400);
      
      // Update popular URLs list
      if (hitCount > 10) {
        await this.addToPopular(shortId, hitCount);
      }
      
      console.log(`📊 Tracked hit for shortId: ${shortId}, total: ${hitCount}`);
      return hitCount;
    } catch (error) {
      console.error('Error tracking hit:', error);
      return 0;
    }
  }

  /**
   * Add URL to popular list
   */
  async addToPopular(shortId, hitCount) {
    try {
      const popularKey = `${this.POPULAR_PREFIX}${shortId}`;
      await redisService.set(popularKey, { shortId, hits: hitCount }, 86400);
      console.log(`⭐ Added to popular: ${shortId}`);
    } catch (error) {
      console.error('Error adding to popular:', error);
    }
  }

  /**
   * Get popular URLs
   */
  async getPopularUrls(limit = 10) {
    try {
      // This is a simplified version
      // In production, you'd use Redis sorted sets
      const popularKeys = await redisService.client.keys(`${this.POPULAR_PREFIX}*`);
      const popularUrls = [];
      
      for (const key of popularKeys.slice(0, limit)) {
        const data = await redisService.get(key);
        if (data) {
          popularUrls.push(data);
        }
      }
      
      return popularUrls.sort((a, b) => b.hits - a.hits);
    } catch (error) {
      console.error('Error getting popular URLs:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const info = await redisService.info();
      return {
        connected: redisService.isConnected,
        info: info ? info.split('\n').slice(0, 10) : null
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { connected: false, info: null };
    }
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      await redisService.client.flushAll();
      console.log('🗑️ Cleared all cache');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}

module.exports = new CacheService();

