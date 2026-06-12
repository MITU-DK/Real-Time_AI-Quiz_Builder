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

// Security Middleware
// Sets secure HTTP headers (X-Content-Type-Options, etc.)
app.use(helmet());

// CORS: Only allow requests from your React frontend origin.
// Update this, when  deploying to production.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
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
