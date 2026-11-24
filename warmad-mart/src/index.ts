
import express, { Request, Response } from "express";
import cors from "cors";
import { withPrisma } from "./config/db.js";

import productRouter from "./routes/product.router.js";
import orderRouter from "./routes/order.router.js";
import authRouter from "./routes/auth.router.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { handleStockNotification } from "./utils/workers/stockWorker.js";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://warmad-mart-fe.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin, misalnya server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: Origin ${origin} tidak diizinkan`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware konteks Prisma
app.use((_req, _res, next) => {
  withPrisma(() => next());
});

// Logger
app.use(loggerMiddleware);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.get("/api/test", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Warmad Mart API berjalan",
  });
});

app.use("/api/queues/stock-notification", handleStockNotification);

// Error handler harus paling akhir
app.use(errorHandler);

// Server lokal
app.listen(PORT, () => {
  console.log(`Warmad Mart API berjalan di http://localhost:${PORT}`);
});

export default app;
