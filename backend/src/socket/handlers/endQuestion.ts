import { Namespace } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  LeaderboardEntry,
} from '../../types';
import { cleanupGame } from '../../services/cleanup.service';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

// DELAY between question_end broadcast and the next question_start (ms)
// it gives players time to read the correct answer and see the leaderboard.
const INTER_QUESTION_DELAY_MS = 5000;

// endQuestion
//
// This is the single shared function that closes an active question.
// It is called from two places:
//   1. scheduler.service.ts  — when Date.now() has passed T_deadline (timeout)
//   2. submitAnswer.ts       — when all players have submitted early
//
// What it does, in order:
//   a. Reads the current question's correct answer from the DB
//   b. Reads the current leaderboard from Redis (sorted set)
//   c. Resolves player nicknames from Redis meta hashes (no DB N+1 queries)
//   d. Broadcasts `question_end` to everyone in the room
//   e. Waits INTER_QUESTION_DELAY_MS seconds
//   f. Either advances to the next question OR:
//      - Syncs final scores to PostgreSQL participants table
//      - Cleans up all Redis keys for this game
//      - Broadcasts `game_over`

export const endQuestion = async (namespace: GameNamespace, pin: string,): Promise<void> => {

  try {

    // 1. Read the current game state from Redis
    //    session:{pin}:state is a Hash we stored when the question started.
    //    It contains: question_index, t_deadline, answer_count, session_id, total_questions
    const state = await redis.hgetall(`session:${pin}:state`);

    if (!state || !state.question_index) {
      console.warn(`[endQuestion] No active state found for pin ${pin}. Skipping.`);
      return;
    }

    const questionIndex = parseInt(state.question_index, 10);
    const sessionId = parseInt(state.session_id, 10);
    const totalQuestions = parseInt(state.total_questions, 10);

    // 2. Look up the correct answer for this question from the DB
    //    We query by session_id and question order so we never rely on stale Redis data
    //    for the answer itself (that would be a security hole).
    const questionResult = await pool.query(
      `SELECT q.id, q.correct_option_index
       FROM questions q JOIN quizzes qz ON qz.id = q.quiz_id JOIN game_sessions gs ON gs.quiz_id = qz.id
       WHERE gs.id = $1
       ORDER BY q.question_order ASC
       LIMIT 1 OFFSET $2`, [sessionId, questionIndex]
    );

    if (questionResult.rows.length === 0) {
      console.error(`[endQuestion] Could not find question ${questionIndex} for session ${sessionId}`);
      return;
    }

    const { correct_option_index } = questionResult.rows[0];

    // 3. Read the leaderboard from Redis sorted set.
    //    ZREVRANGEBYSCORE returns members highest-score first.
    //    'WITHSCORES' gives us the scores alongside the IDs.
    const leaderboardRaw = await redis.zrevrangebyscore(
      `session:${pin}:leaderboard`, '+inf', '-inf', 'WITHSCORES'
    );

    // leaderboardRaw is a flat array: [playerId, score, playerId, score, ...]
    // We need to pair them up and resolve nicknames from the player meta cache in Redis.
    // This avoids an N+1 PostgreSQL query (one SELECT per player).
    const leaderboard: LeaderboardEntry[] = [];
    for (let i = 0; i < leaderboardRaw.length; i += 2) {

      const playerId = parseInt(leaderboardRaw[i], 10);
      const score = parseFloat(leaderboardRaw[i + 1]); // Redis Sorted Set Scores are always Floats

      // Look up nickname from the player meta hash we wrote in connection.handler.ts.
      // Falls back to a generic label if the key has expired or is missing.
      const nickname =
        (await redis.hget(`player:${playerId}:meta`, 'nickname')) ?? `Player ${playerId}`;

      leaderboard.push({ playerId, score, nickname });
    }

    // 4. Broadcast question_end to every socket in this room
    namespace.to(pin).emit('question_end', {
      questionIndex,
      correctOptionIndex: correct_option_index,
      leaderboard,
    });

    console.log(`[endQuestion] Question ${questionIndex} closed for room ${pin}. Broadcasting leaderboard.`);

    // 5. Update current_question_index in the DB to track where we are
    await pool.query(
      `UPDATE game_sessions SET current_question_index = $1 WHERE id = $2`, [questionIndex + 1, sessionId]
    );

    // 6. Wait for the inter-question delay (players read the result screen)
    await new Promise<void>((resolve) => setTimeout(resolve, INTER_QUESTION_DELAY_MS));

    // 7. Advance to next question OR end the game
    const nextIndex = questionIndex + 1;

    if (nextIndex >= totalQuestions) {

      // ── GAME OVER ────────────────────────────────────────────────────────

      // 7a. Mark the game as finished in PostgreSQL
      await pool.query(
        `UPDATE game_sessions SET status = 'game_finished', finished_at = NOW() WHERE id = $1`, [sessionId]
      );

      // 7b. Write final scores and ranks back to the participants table.
      //     We do all updates in parallel with Promise.all so we make one
      //     round-trip per player but don't wait for each one sequentially.
      const playerIds: number[] = [];

      await Promise.all(
        leaderboard.map(({ playerId, score }, index) => {
          playerIds.push(playerId);
          const finalRank = index + 1; // leaderboard is already sorted highest-first
          return pool.query(`UPDATE participants SET score = $1, final_rank = $2 WHERE id = $3`, [score, finalRank, playerId]);
        })
      );

      console.log(`[endQuestion] Final scores written to DB for ${playerIds.length} players in room ${pin}.`);

      // 7c. Clean up all transient Redis keys for this game.
      //     Must happen AFTER we've finished reading from Redis above.
      await cleanupGame(pin, playerIds);

      // 7d. Broadcast game_over with the final leaderboard
      namespace.to(pin).emit('game_over', { finalLeaderboard: leaderboard });

      console.log(`[endQuestion] Game finished for room ${pin}.`);

    }
    else {

      //ADVANCE TO NEXT QUESTION 
      // We import advanceToQuestion lazily to avoid a circular import between
      // endQuestion.ts → game.handler.ts → endQuestion.ts.
      const { advanceToQuestion } = await import('./advanceToQuestion');
      await advanceToQuestion(namespace, pin, nextIndex, sessionId, totalQuestions);
    }

  } catch (err) {
    console.error(`[endQuestion] Error while closing question for pin ${pin}:`, err);
  }
};
