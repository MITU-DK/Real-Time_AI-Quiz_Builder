import { Namespace, Socket } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import { ServerToClientEvents, ClientToServerEvents, SocketData, QuestionRow } from '../../types';

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
        `SELECT p.id, p.nickname, p.score, gs.current_question_index, gs.status, gs.id as session_id
         FROM participants p JOIN game_sessions gs ON gs.id = p.session_id
         WHERE p.id = $1 AND gs.pin = $2 LIMIT 1`, [playerId, pin]
      );

      if (participantResult.rows.length === 0) {
        socket.emit('error', 'Player record not found. Cannot reconcile session.');
        return;
      }

      const { nickname, score, current_question_index, status, session_id } = participantResult.rows[0];

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

      // 5. Check if a question is currently active by reading Redis session state.
      //    If t_deadline is still in the future, the player reconnected mid-question.
      //    We must fetch the full question and include it in the reconciled payload
      //    so their screen can render it immediately — they missed the question_start event.
      let activeQuestion: {
        questionText: string;
        options: string[];
        tDeadline: number;
        points: number;
      } | undefined = undefined;

      const state = await redis.hgetall(`session:${pin}:state`);

      if (state && state.t_deadline) {
        const tDeadline = parseInt(state.t_deadline, 10);
        const questionIndex = parseInt(state.question_index, 10);

        // Question is still live — fetch its text and options from PostgreSQL
        if (Date.now() < tDeadline) {
          const questionResult = await pool.query<QuestionRow>(
            `SELECT q.question_text, q.options, q.points
             FROM questions q JOIN quizzes qz ON qz.id = q.quiz_id JOIN game_sessions gs ON gs.quiz_id = qz.id
             WHERE gs.id = $1 ORDER BY q.question_order ASC LIMIT 1 OFFSET $2`,
            [session_id, questionIndex]
          );

          if (questionResult.rows.length > 0) {

            const q = questionResult.rows[0];

            activeQuestion = {
              questionText: q.question_text,
              options: q.options,
              tDeadline,
              points: q.points,
            };
          }
        }
      }

      // 6. Send the catch-up (reconciliation) payload to just this socket
      socket.emit('reconciled', {
        playerId, score, currentQuestionIndex: current_question_index, ...(activeQuestion && { activeQuestion }),
      });

      console.log(`[Socket] Player "${nickname}" (id:${playerId}) successfully reconciled into room ${pin}`);

    }
    catch (err) {
      console.error('[Socket] rejoin_room error:', err);
      socket.emit('error', 'An internal error occurred during reconnection.');
    }
  });
};

