import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { verifyDatabaseConnection } from './db/pool';
import { initSocket } from './socket';
import { startScheduler } from './services/scheduler.service';

const PORT = process.env.PORT || 3001;


const startServer = async (): Promise<void> => {

  console.log('🚀 Starting Real-Time AI Quiz Builder backend...');

  // Step 1: Verify PostgreSQL is reachable before opening the port
  await verifyDatabaseConnection();

  // Step 2: Create a raw HTTP server from the Express app.
  //         Socket.IO needs a reference to this HTTP server. so it can intercept the WebSocket upgrade handshake.
  const httpServer = http.createServer(app);

  // Step 3: Attach Socket.IO to the HTTP server
  const io = initSocket(httpServer);

  // Step 4: Start the background game scheduler.
  // This 100ms polling loop watches for question deadlines in Redis and triggers question_end when time runs out (the timeout path).
  const gameNamespace = io.of('/game');
  startScheduler(gameNamespace);

  // Step 5: Start the HTTP server (Socket.IO rides on the same port as Express)

  httpServer.listen(PORT, () => {
    console.log(`✅ [Server]    HTTP running on http://localhost:${PORT}`);
    console.log(`🔌 [Server]    WebSocket gateway at ws://localhost:${PORT}/game`);
    console.log(`📋 [Server]    Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 [Server]    Auth endpoint:     POST /api/auth/login`);
    console.log(`📝 [Server]    Quiz endpoint:     POST /api/quizzes`);
    console.log(`🤖 [Server]    AI Gen endpoint:   POST /api/quizzes/generate`);
    console.log(`❤️  [Server]    Health check:      GET  /health`);
  });

};

startServer().catch((error) => {
  console.error('❌ [Server] Fatal startup error:', error);
  process.exit(1);
});
