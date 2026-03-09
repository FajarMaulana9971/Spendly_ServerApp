import { createClient } from "redis";
import "dotenv/config";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) return new Error("Redis max retries reached");
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 10000,
  },
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// Connect on startup
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }
})();

export default redisClient;
