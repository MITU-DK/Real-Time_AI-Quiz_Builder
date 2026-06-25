import { Namespace, Socket } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '../../types';
import { endQuestion } from './endQuestion';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const handleSubmitAnswer = (namespace: GameNamespace, socket: GameSocket): void => {

  // Called by a player when they tap an answer option.
  socket.on('submit_answer', async ({ pin, questionIndex, selectedOptionIndex }) => {

    try {

      const playerId = socket.data.playerId;

      if (!playerId) {
        socket.emit('error', 'You are not registered in this game.');
        return;
      }

      // 1. Read the current session state from Redis (single HGETALL)
      const state = await redis.hgetall(`session:${pin}:state`);

      if (!state || !state.t_deadline) {
        // No active question — either game hasn't started or already ended
        return;
      }

      // 2. Guard against stale answers (player submitting for the PREVIOUS question)
      if (parseInt(state.question_index, 10) !== questionIndex) {
        return; // silently discard
      }

      const tDeadline = parseInt(state.t_deadline, 10);
      const tStart = parseInt(state.t_start, 10);
      const sessionId = parseInt(state.session_id, 10);

      // 3. SERVER-SIDE DEADLINE CHECK
      //    If the answer arrives after the deadline, award 0 points and reject.
      //    This is the anti-cheat: the client's visual timer doesn't matter.
      const arrivalTime = Date.now();
      if (arrivalTime > tDeadline) {
        console.log(`[game] Late submission from player ${playerId} in room ${pin}. Rejected.`);
        return;
      }

      // 4. Look up the correct answer from the DB (never trust Redis for this)
      const questionResult = await pool.query(
        `SELECT q.id, q.correct_option_index, q.time_limit_seconds, q.points
         FROM questions q
         JOIN quizzes qz ON qz.id = q.quiz_id
         JOIN game_sessions gs ON gs.quiz_id = qz.id
         WHERE gs.id = $1
         ORDER BY q.question_order ASC LIMIT 1 OFFSET $2`, [sessionId, questionIndex]
      );

      if (questionResult.rows.length === 0) return;

      const {
        id: questionId,
        correct_option_index,
        time_limit_seconds,
        points: pMax,
      } = questionResult.rows[0];

      const isCorrect = selectedOptionIndex === correct_option_index;

      // 5. SCORE DECAY FORMULA (only for correct answers within the window)
      //    Score = floor( (1 - R_time / (2 * Q_timer)) * P_max )
      //    Where:
      //      R_time   = milliseconds elapsed since the question started
      //      Q_timer  = total question duration in milliseconds
      //      P_max    = max points for this question (from DB)
      //
      //    This guarantees:
      //      - Answer immediately → P_max points (e.g. 1000)
      //      - Answer at the last ms → P_max * 0.5 (e.g. 500)
      let pointsAwarded = 0;
      if (isCorrect) {
        const rTime = arrivalTime - tStart;          // how long the player took (ms)
        const qTimer = time_limit_seconds * 1000;     // total window (ms)
        pointsAwarded = Math.floor((1 - rTime / (2 * qTimer)) * pMax);
        // Clamp to a minimum of half the max (edge case: answer right at deadline)
        pointsAwarded = Math.max(pointsAwarded, Math.floor(pMax / 2));
      }

      // 6. Atomically update the player's cumulative score in the Redis sorted set.
      //    ZINCRBY is O(log N) and thread-safe.
      if (pointsAwarded > 0) {
        await redis.zincrby(`session:${pin}:leaderboard`, pointsAwarded, playerId.toString());
      }

      // 7. Write this answer to the responses table in PostgreSQL for post-game analysis
      await pool.query(
        `INSERT INTO responses
           (session_id, participant_id, question_id, selected_option_index, is_correct, response_time_ms, points_awarded)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (participant_id, question_id) DO NOTHING`,
        [sessionId, playerId, questionId, selectedOptionIndex, isCorrect, arrivalTime - tStart, pointsAwarded]
      );

      console.log(`[game] Player ${playerId} answered Q${questionIndex} in room ${pin}. Correct: ${isCorrect}. Points: ${pointsAwarded}`);

      // 8. Increment the answer counter for this question
      const answerCount = await redis.hincrby(`session:${pin}:state`, 'answer_count', 1);
      namespace.to(pin).emit('answer_count_updated', { answerCount });

      // 9. EARLY TERMINATION CHECK
      //    If every connected player has answered, end the question immediately.
      const totalPlayers = await redis.scard(`room:${pin}:presence`);

      if (answerCount >= totalPlayers) {

        console.log(`[game] All ${totalPlayers} players answered in room ${pin}. Ending question early.`);

        // Remove from the scheduler's set so it doesn't fire again
        await redis.zrem('game_updates', pin);

        // End the question (shows leaderboard, then advances)
        await endQuestion(namespace, pin);
      }

    }
    catch (err) {
      console.error('[game] submit_answer error:', err);
      socket.emit('error', 'Failed to process your answer.');
    }

  });
};
