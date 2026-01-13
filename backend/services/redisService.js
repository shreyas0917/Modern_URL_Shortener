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
      // Check if Redis credentials are provided
      if (!process.env.REDIS_HOST || !process.env.REDIS_PASSWORD) {
        console.warn('⚠️ Redis credentials not found in environment variables. Redis will not be available.');
        return false;
      }

      this.client = createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '14389'),
          connectTimeout: 5000, // 5 second timeout
          reconnectStrategy: false // Disable auto-reconnect to prevent spam
        }
      });

      // Only log errors once, don't spam
      let errorLogged = false;
      this.client.on('error', err => {
        if (!errorLogged) {
          console.error('❌ Redis connection error:', err.message);
          errorLogged = true;
        }
      });

      // Set connection timeout
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Redis connected successfully');
      this.isConnected = true;
      return true;
    } catch (error) {
      // Only log once, don't spam
      if (error.code === 'ENOTFOUND' || error.message.includes('timeout')) {
        console.error('❌ Failed to connect to Redis:', error.message);
        console.error('💡 Possible causes:');
        console.error('   1. Redis Cloud instance is paused or deleted');
        console.error('   2. Redis hostname is incorrect');
        console.error('   3. Network connectivity issues');
        console.error('   4. IP address not whitelisted in Redis Cloud');
        console.error('⚠️  Application will continue without Redis caching');
      } else {
        console.error('❌ Failed to connect to Redis:', error.message);
      }
      this.isConnected = false;
      // Clean up failed connection
      if (this.client) {
        try {
          await this.client.quit().catch(() => {});
        } catch (e) {}
        this.client = null;
      }
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
