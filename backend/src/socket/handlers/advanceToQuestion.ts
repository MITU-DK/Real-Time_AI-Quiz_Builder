import { Namespace } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import { ServerToClientEvents, ClientToServerEvents, SocketData, QuestionRow, } from '../../types';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

// Exported so that endQuestion.ts can call it after the 5s inter-question delay.
// Broadcasts `question_start` to all players in the room and stores the deadline in Redis 
// so both submit_answer and the scheduler can reference it.

export const advanceToQuestion = async (namespace: GameNamespace, pin: string, questionIndex: number, sessionId: number, totalQuestions: number,): Promise<void> => {

  // 1. Load the question at the given index from PostgreSQL
  //Find  question at position 'questionIndex' for the quiz with current sessionId.
  const result = await pool.query<QuestionRow>(
    `SELECT q.* FROM questions q
     JOIN quizzes qz ON qz.id = q.quiz_id JOIN game_sessions gs ON gs.quiz_id = qz.id
     WHERE gs.id = $1 ORDER BY q.question_order ASC LIMIT 1 OFFSET $2`, [sessionId, questionIndex]
  );

  if (result.rows.length === 0) {
    console.error(`[game] No question at index ${questionIndex} for session ${sessionId}`);
    return;
  }

  const question = result.rows[0];

  // 2. Calculate the absolute deadline
  //    T_deadline is the exact UTC millisecond when this question closes.
  //    Storing in redis so both the scheduler and submit_answer can read it.
  const tStart = Date.now();
  const tDeadline = tStart + question.time_limit_seconds * 1000;

  // 3. Write the session state into Redis
  //    - question_index   → which question we're on (for endQuestion to read)
  //    - t_start          → when this question began (for score decay math)
  //    - t_deadline       → when answers stop being accepted
  //    - answer_count     → incremented by each submit_answer (for early termination)
  //    - session_id       → so endQuestion can query the DB without extra lookups
  //    - total_questions  → so endQuestion knows when to stop
  await redis.hset(`session:${pin}:state`, {
    question_index: questionIndex.toString(),
    t_start: tStart.toString(),
    t_deadline: tDeadline.toString(),
    answer_count: '0',
    session_id: sessionId.toString(),
    total_questions: totalQuestions.toString(),
  });

  // 4. Update the current_question_index in the DB
  await pool.query(
    `UPDATE game_sessions SET current_question_index = $1 WHERE id = $2`, [questionIndex, sessionId]
  );

  // 5. Register this room's deadline in the scheduler's sorted set.
  //    The scheduler checks this every 100ms and calls endQuestion when time is up.
  //    Score is the T_deadline value so ZRANGEBYSCORE can find expired rooms.
  await redis.zadd('game_updates', tDeadline, pin);

  // 6. Broadcast the question to everyone in the room.
  //    We intentionally do NOT send correct_option_index — that stays server-side.
  namespace.to(pin).emit('question_start', {
    questionIndex,
    questionText: question.question_text,
    options: question.options as string[],
    timeLimitSeconds: question.time_limit_seconds,
    points: question.points,
    tDeadline,
  });

  console.log(`[game] Question ${questionIndex} started for room ${pin}. Deadline: ${new Date(tDeadline).toISOString()}`);
};
