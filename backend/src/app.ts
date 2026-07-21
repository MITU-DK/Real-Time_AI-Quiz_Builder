import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import quizRoutes from "./routes/quizRoutes";
import gameRoutes from "./routes/gameRoutes";

dotenv.config();

const app = express();

// Trust Railway/Vercel reverse proxy so express-rate-limit can read
// X-Forwarded-For headers correctly. Without this it throwing an ValidationError on every request behind a cloud proxy.
app.set('trust proxy', 1);

// Security Middleware
// Sets secure HTTP headers (X-Content-Type-Options, etc.)
app.use(helmet());

// CORS: Allow frontend origins (all Vercel deployments, FRONTEND_ORIGIN, and localhost)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const configuredOrigin = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.replace(/\/$/, '') : '';

      if (
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        (configuredOrigin && origin.startsWith(configuredOrigin))
      ) {
        return callback(null, true);
      }

      // Permissive fallback so user/friends on any domain are never blocked
      return callback(null, true);
    },
    credentials: true,
  })
);
// Body Parsing
app.use(express.json({ limit: "10kb" })); // Reject payloads > 10kb
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting, 100 requests per 15 minutes per IP.
// Prevents brute-force attacks on all API endpoints.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", globalLimiter);

// Stricter limiter for auth routes (10 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please wait 15 minutes." },
});
app.use("/api/auth", authLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/game", gameRoutes);

// Health Check Endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 Handler — catches any unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

export default app;
