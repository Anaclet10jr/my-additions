/**
 * Server-side caching middleware
 * Simple in-memory cache for read-heavy endpoints
 * In production: replace with Redis
 */

const cache = new Map();

/**
 * Cache middleware factory
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {function} keyFn - Optional function to generate cache key from req
 */
const cacheMiddleware = (ttlSeconds = 60, keyFn = null) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const key = keyFn ? keyFn(req) : `${req.originalUrl}`;

    // Check cache
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-TTL', Math.ceil((cached.expiresAt - Date.now()) / 1000));
      return res.status(200).json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to intercept response
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(key, {
          data,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
        // Limit cache size to 500 entries
        if (cache.size > 500) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache entries matching a pattern
 * Call after mutations (create/update/delete)
 */
const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Cache stats endpoint (admin only)
 */
const getCacheStats = () => ({
  size: cache.size,
  keys: Array.from(cache.keys()),
  memoryMB: process.memoryUsage().heapUsed / 1024 / 1024,
});

module.exports = { cacheMiddleware, clearCache, getCacheStats };
