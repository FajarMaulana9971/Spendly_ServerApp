import redisClient from "../configs/cache.js";

function cacheMiddleware(duration = 300) {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache_${req.originalUrl}`;

    try {
      const isConnected = redisClient.isOpen;
      if (!isConnected) {
        console.warn("⚠️ Redis not connected, skipping cache");
        return next();
      }

      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        console.log(`🟢 Cache hit: ${key}`);
        return res.json(JSON.parse(cachedResponse));
      }

      console.log(`🔴 Cache miss: ${key}`);

      const originalJson = res.json.bind(res);

      res.json = (body) => {
        res.json = originalJson; // restore segera

        if (redisClient.isOpen) {
          redisClient
            .setEx(key, duration, JSON.stringify(body))
            .then(() => console.log(`💾 Cached: ${key}`))
            .catch((err) => console.error("❌ Redis set error:", err.message));
        }

        return originalJson(body); // sync — response langsung terkirim
      };

      next();
    } catch (err) {
      console.error("❌ Cache middleware error:", err.message);
      next();
    }
  };
}

export default cacheMiddleware;
