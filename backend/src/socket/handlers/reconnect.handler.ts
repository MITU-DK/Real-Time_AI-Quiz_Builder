import { Namespace, Socket } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import { ServerToClientEvents, ClientToServerEvents, SocketData, } from '../../types';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const handleReconnect = (namespace: GameNamespace, socket: GameSocket) => {

  //EVENT: rejoin_room 
  // Fired by the client after a network dropout when Socket.IO re-establishes the connection.
  // The client supplies their stored playerId and pin from localStorage.
  socket.on('rejoin_room', async ({ playerId, pin }) => {
    try {
      // 1. Fetch player details, current question, and session status from PostgreSQL
      const participantResult = await pool.query(
        `SELECT p.id, p.nickname, p.score, gs.current_question_index, gs.status
         FROM participants p JOIN game_sessions gs ON gs.id = p.session_id
         WHERE p.id = $1 AND gs.pin = $2 LIMIT 1`, [playerId, pin]
      );

      if (participantResult.rows.length === 0) {
        socket.emit('error', 'Player record not found. Cannot reconcile session.');
        return;
      }

      const { nickname, score, current_question_index, status } = participantResult.rows[0];

      // 2. Ensure the game hasn't already ended
      if (status === 'game_finished') {
        socket.emit('error', 'Your session has expired or the game has ended.');
        return;
      }

      //reconnect usually creates a new socket.
      // 3. Update the socket-to-player mapping and re-add to presence set
      await Promise.all([
        redis.sadd(`room:${pin}:presence`, playerId.toString()), // Put them back in the room
        redis.hset(`socket:${socket.id}`, {
          playerId: playerId.toString(), pin, nickname,
        }),
        redis.expire(`socket:${socket.id}`, 86400),
      ]);

      // 4. Re-join the Socket.IO room
      socket.join(pin);

      // Update socket data
      socket.data.playerId = playerId;
      socket.data.pin = pin;
      socket.data.nickname = nickname;

      // 5. Send the catch-up (reconciliation) payload to just this socket
      socket.emit('reconciled', {
        playerId, score, currentQuestionIndex: current_question_index,
      });

      console.log(`[Socket] Player "${nickname}" (id:${playerId}) successfully reconciled into room ${pin}`);

    }
    catch (err) {
      console.error('[Socket] rejoin_room error:', err);
      socket.emit('error', 'An internal error occurred during reconnection.');
    }
  });
};
