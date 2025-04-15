const Redis = require('redis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/cache.log' })
  ]
});

let client = null;
let cacheMiddleware = null;
let invalidateCache = null;

if (process.env.NODE_ENV === 'production') {
  const redisOptions = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Max retries reached');
        }
        return Math.min(retries * 100, 3000);
      },
      connectTimeout: 10000,
    },
    maxRetriesPerRequest: 3,
  };

  client = Redis.createClient(redisOptions);

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('error', (err) => {
    logger.error('Redis client error:', err);
  });

  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });

  client.on('end', () => {
    logger.warn('Redis client connection closed');
  });

  (async () => {
    try {
      await client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
    }
  })();

  cacheMiddleware = (duration) => {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl || req.url}`;

      try {
        const cachedResponse = await client.get(key);
        if (cachedResponse) {
          return res.json(JSON.parse(cachedResponse));
        }

        const originalJson = res.json;
        
        res.json = function (data) {
          client.setEx(key, duration, JSON.stringify(data))
            .catch(err => logger.error('Cache set error:', err));
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  };

  invalidateCache = async (pattern) => {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        logger.info(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  };
} else {
  // Development environment - no-op middleware
  cacheMiddleware = () => (req, res, next) => next();
  invalidateCache = async () => {};
}

module.exports = {
  client,
  cacheMiddleware,
  invalidateCache
}; 