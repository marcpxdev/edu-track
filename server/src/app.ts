import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error";
import { env } from "./config/env";
import { logger } from "./config/logger";
import apiRouter from "./modules";

export function createApp() {
  const app = express();

  // Trust proxy (Render/Vercel sit behind a proxy)
  app.set("trust proxy", 1);

  // Security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: env.IS_PRODUCTION ? undefined : false,
    })
  );

  // CORS — only the frontend origin in production
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate limiting (global)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: env.IS_PRODUCTION ? 100 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "edutrack-api" });
  });

  // API routes
  app.use("/api/v1", apiRouter);

  // 404 for unknown routes
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
