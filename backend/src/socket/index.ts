import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, SocketData, } from '../types';
import { handleConnection } from './handlers/connection.handler';
import { handleDisconnect } from './handlers/disconnect.handler';
import { handleReconnect } from './handlers/reconnect.handler';
import { handleSync } from './handlers/sync.handler';
import { handleGame } from './handlers/game.handler';

export const initSocket = (httpServer: HttpServer): SocketIOServer => {

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {

    cors: {
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // PERFORMANCE: Disable per-message compression.
    // Real-time quiz payloads are tiny (<500 bytes). Running deflate compression
    // on thousands of small packets adds CPU overhead and increases latency.
    perMessageDeflate: false,
    // Connection state recovery: if connection drops briefly, Socket.IO can
    // restore event history and room memberships automatically.
    connectionStateRecovery: {
      maxDisconnectionDuration: 30 * 1000, // 30 seconds
    },
  });

  // Create the dedicated /game namespace — isolates gameplay events from any future admin or monitoring namespaces.
  const gameNamespace = io.of('/game');

  gameNamespace.on('connection', (socket) => {

    console.log(`[Socket] New connection: ${socket.id}`);

    // Phase 3 handlers
    handleConnection(gameNamespace, socket);  // join_room + join_as_host
    handleDisconnect(gameNamespace, socket);  // disconnect cleanup
    handleReconnect(gameNamespace, socket);   // rejoin_room reconciliation

    // Phase 4 handlers
    handleSync(socket);                       // sync_time NTP handshake
    handleGame(gameNamespace, socket);        // start_game + submit_answer

  });

  console.log('✅ [Socket.IO] Gateway initialized on /game namespace.');

  return io;
};
