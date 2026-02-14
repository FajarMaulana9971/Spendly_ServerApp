import cache from '../configs/cache.js'

function cacheMiddleware(duration = 300) {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache_${req.originalUrl}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            console.log(`Cache hit for: ${key}`);
            return res.json(cachedResponse);
        }

        console.log(`Cache miss for: ${key}`);

        const originalJson = res.json.bind(res);
        res.json = (body) => {
            cache.set(key, body, duration);
            return originalJson(body);
        };

        next();
    };
}

export default cacheMiddleware;