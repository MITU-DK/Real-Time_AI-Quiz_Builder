import { Namespace, Socket } from 'socket.io';
import { redis } from '../../config/redis';
import { ServerToClientEvents, ClientToServerEvents, SocketData, } from '../../types';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const handleDisconnect = (namespace: GameNamespace, socket: GameSocket) => {

  // EVENT: disconnect 
  // Fired automatically by Socket.IO when a client's connection drops
  socket.on('disconnect', async (reason) => {

    console.log(`[Socket] Socket ${socket.id} disconnected. Reason: ${reason}`);

    try {
      // 1. Look up the player's data from Redis using socket ID
      const socketData = await redis.hgetall(`socket:${socket.id}`);

      if (!socketData || !socketData.playerId) {
        // Could be a host or an anonymous connection that never joined — nothing to clean up
        return;
      }

      const { playerId, pin, nickname } = socketData;

      // 2. Remove from the room's presence Set in Redis
      await redis.srem(`room:${pin}:presence`, playerId);

      // 3. Clean up the socket-player mapping
      await redis.del(`socket:${socket.id}`);

      // 4. Get updated player count
      const totalPlayers = await redis.scard(`room:${pin}:presence`);

      // 5. Notify all remaining sockets in the room (host + other players)
      namespace.to(pin).emit('player_left', {
        playerId: parseInt(playerId, 10), nickname, totalPlayers,
      });

      console.log(`[Socket] Player "${nickname}" (id:${playerId}) removed from room ${pin}. Players remaining: ${totalPlayers}`);

    } catch (err) {
      console.error('[Socket] disconnect cleanup error:', err);
    }
  });
};
