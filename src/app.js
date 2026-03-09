import express from "express";
import cors from "cors";
import expenseRouter from "./routes/expenseRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import errorHandler from "./middlewares/errorHandlerMiddleware.js";
import redisClient from "./configs/cache.js";
import prisma from "./configs/database.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (used by cron job to keep app awake)
app.get("/health", async (req, res) => {
  const redisStatus = redisClient.isOpen ? "connected" : "disconnected";
  let dbStatus = "connected";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
  }

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus,
      database: dbStatus,
    },
  });
});

// Ping endpoint (lightweight, for cron keep-alive)
app.get("/ping", (req, res) => {
  res.json({ pong: true, ts: Date.now() });
});

app.use("/api", expenseRouter);
app.use("/api", paymentRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
