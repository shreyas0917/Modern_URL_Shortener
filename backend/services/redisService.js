const { createClient } = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis
   */
  async connect() {
    try {
      this.client = createClient({
        username: 'default',
        password: 'Q4frZuYQAnne8BFi3L2SesF0JWUk0nZW',
        socket: {
          host: 'redis-14389.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
          port: 14389
        }
      });

      this.client.on('error', err => console.log('Redis Client Error', err));

      await this.client.connect();
      console.log('✅ Redis connected successfully');
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log('🔌 Redis disconnected');
    }
  }

  /**
   * Set a key-value pair with TTL
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl > 0) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Get a value by key
   */
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Increment a counter
   */
  async incr(key) {
    if (!this.isConnected) return 0;
    
    try {
      const result = await this.client.incr(key);
      return result;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key, ttl) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys) {
    if (!this.isConnected) return [];
    
    try {
      const values = await this.client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return [];
    }
  }

  /**
   * Get Redis info
   */
  async info() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error('Redis INFO error:', error);
      return null;
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
