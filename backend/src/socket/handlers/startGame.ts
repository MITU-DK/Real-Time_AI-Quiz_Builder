import { Namespace, Socket } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '../../types';
import { advanceToQuestion } from './advanceToQuestion';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const handleStartGame = (namespace: GameNamespace, socket: GameSocket): void => {
  //EVENT: trigger_countdown
  // Host triggers the 3..2..1 overlay for all clients in the room
  socket.on('trigger_countdown', async ({ pin }) => {
    try {
      if (!socket.data.hostId) return;
      namespace.to(pin).emit('show_countdown');
    } catch (err) {
      console.error('[game] trigger_countdown error:', err);
    }
  });

  //EVENT: start_game
  // Only the host should emit this. We verify they own the session.
  socket.on('start_game', async ({ pin }) => {

    try {

      // 1. Verify this socket is actually the host of the session
      if (!socket.data.hostId) {
        socket.emit('error', 'Only the host can start the game.');
        return;
      }

      // 2. get session id, host id and total numbers of questions . for the given pin.
      const sessionResult = await pool.query(
        `SELECT gs.id, gs.quiz_id, gs.status, gs.host_id,
                (SELECT COUNT(*) FROM questions q WHERE q.quiz_id = gs.quiz_id) AS total_questions
         FROM game_sessions gs WHERE gs.pin = $1`, [pin]
      );

      if (sessionResult.rows.length === 0) {
        socket.emit('error', 'Game session not found.');
        return;
      }

      const session = sessionResult.rows[0];

      // 3. Only the session's registered host can start
      if (session.host_id !== socket.data.hostId) {
        socket.emit('error', 'You are not the host of this session.');
        return;
      }

      // 4. Guard: game must still be in lobby state
      if (session.status !== 'lobby_waiting') {
        socket.emit('error', 'Game has already started or finished.');
        return;
      }

      // 5. Transition the game status in the DB
      await pool.query(
        `UPDATE game_sessions SET status = 'in_progress', started_at = NOW() WHERE id = $1`,
        [session.id]
      );

      // 6. Initialize the leaderboard sorted set in Redis.
      //    We seed every player from the presence set with score 0
      //    so they appear on the leaderboard even if they never answer.
      const playerIds = await redis.smembers(`room:${pin}:presence`);
      if (playerIds.length > 0) {  // Build arguments for a single ZADD call: [score, member, score, member ...]

        const zaddArgs = playerIds.flatMap((id) => [0, id]);

        await (redis.zadd as Function)(`session:${pin}:leaderboard`, ...zaddArgs);
      }

      const totalQuestions = parseInt(session.total_questions, 10);

      console.log(`[game] Host started game for room ${pin}. ${totalQuestions} questions.`);

      // 7. Start question 0
      await advanceToQuestion(namespace, pin, 0, session.id, totalQuestions);

    }
    catch (err) {
      console.error('[game] start_game error:', err);
      socket.emit('error', 'Failed to start the game.');
    }

  });
};
