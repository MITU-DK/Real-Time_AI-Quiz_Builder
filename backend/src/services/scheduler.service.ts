import { Namespace } from 'socket.io';
import { redis } from '../config/redis';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../types';
import { endQuestion } from '../socket/handlers/endQuestion';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

// How often the scheduler checks for expired questions (ms).
// 100ms is low-overhead but still responsive — worst case a question
// closes 100ms after its deadline, which is imperceptible to players.
const POLL_INTERVAL_MS = 100;

// startScheduler
//
// Starts a lightweight setInterval loop that fires every 100ms.
// On each tick it asks Redis: "Are there any rooms whose deadline has passed?"
//
// We use a Redis Sorted Set called `game_updates`:
//   - score  = T_deadline (absolute ms timestamp)
//   - member = pin (the room's game PIN)
//
// ZRANGEBYSCORE game_updates -inf {now} returns all rooms whose deadline
// is in the past. For each one, we:
//   1. Remove it from the set (so it doesn't fire again)
//   2. Call endQuestion(pin) to close the question and broadcast results
//
// This design means the server never has one timer per room running in memory.
// A single global interval handles ALL active game rooms simultaneously.

export const startScheduler = (namespace: GameNamespace): void => {

  setInterval(async () => {

    try {

      const now = Date.now();

      // Give me all rooms whose deadline <= now
      const expiredRooms = await redis.zrangebyscore('game_updates', '-inf', now);

      if (expiredRooms.length === 0) return; // nothing to do this tick

      for (const pin of expiredRooms) {

        // Atomically remove from the scheduled set FIRST.
        // This prevents a race condition where two ticks both try to end
        // the same question (ZREM returns 1 if we won the race, 0 if not).
        const removed = await redis.zrem('game_updates', pin);

        if (removed === 0) {
          // Another tick already processed this room — skip it.
          continue;
        }

        console.log(`[Scheduler] Deadline expired for room ${pin}. Ending question.`);

        // End the question ,broadcast the leaderboard and advance to the next question (or game_over).
        // We do NOT await here in the loop — each room processes concurrently.
        endQuestion(namespace, pin).catch((err) => {
          console.error(`[Scheduler] Error ending question for pin ${pin}:`, err);
        });

      }

    } catch (err) {
      console.error('[Scheduler] Poll tick error:', err);
    }

  }, POLL_INTERVAL_MS);

  console.log(`✅ [Scheduler] Background game loop started. Polling every ${POLL_INTERVAL_MS}ms.`);
};
