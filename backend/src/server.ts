import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { verifyDatabaseConnection } from "./db/pool";

const PORT = process.env.PORT || 3001;

// Server Startup Sequence
// Milestone 1.4: Connection Verification Hook

// Order matters v.v.important:
// 1. Verify DB connection FIRST — if DB is down, exit cleanly.
// 2. Only start the HTTP listener if the DB is healthy.

const startServer = async (): Promise<void> => {
  console.log("🚀 Server Starting Real-Time AI Quiz Builder backend...");

  // Step 1: Verify PostgreSQL is reachable before opening the port
  await verifyDatabaseConnection();

  // Step 2: Start listening for HTTP requests
  app.listen(PORT, () => {
    console.log(`✅ [Server] Running on http://localhost:${PORT}`);
    console.log(`📋 [Server] Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 [Server] Auth endpoint: POST /api/auth/login`);
    console.log(`📝 [Server] Quiz endpoint:  POST /api/quizzes`);
    console.log(`❤️  [Server] Health check:  GET  /health`);
  });
};

startServer().catch((error) => {
  console.error("❌ [Server] Fatal startup error:", error);
  process.exit(1);
});
