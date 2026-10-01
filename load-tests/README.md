# QuizArena — Load Test

Validates that the Socket.IO game server can sustain **500 concurrent WebSocket connections** under a simulated player flood.

## Files

| File | Purpose |
|------|---------|
| `load-test.js` | Custom Node.js load test harness |
| `results.json` | Output from the last test run (auto-generated) |

## How It Works

The script spawns up to 500 virtual players in a ramp-up pattern:

1. **Connect** to the `/game` Socket.IO namespace on `localhost:3001`
2. **Emit** `join_room` with the game PIN and a unique nickname
3. **Listen** for the `player_joined` acknowledgement from the server
4. **Hold** the open WebSocket connection for 30 seconds (simulates real concurrent load)
5. **Disconnect** cleanly

## Prerequisites

1. Backend must be running locally (`cd backend && npm run dev`)
2. Redis must be running (`docker run -d --name quiz_redis -p 6379:6379 redis:latest`)
3. Create a game session via the frontend or API and get a **Game PIN**

## Running the Test

```bash
TEST_PIN=<your-pin> node load-tests/load-test.js
```

To override target URL or user count:

```bash
TARGET_URL=http://localhost:3001 MAX_USERS=500 TEST_PIN=123456 node load-tests/load-test.js
```

## Verified Results

Tested locally on a single Node.js server process (no Redis adapter, single instance):

```
════════════════════════════════════════════════════
  📊  LOAD TEST RESULTS
════════════════════════════════════════════════════
  Total users launched    : 500
  Sockets connected       : 500
  Successfully joined     : 500
  Errors                  : 0
  Peak concurrent conns   : 500
  Success rate            : 100.0%
  Test duration           : 62.3s
────────────────────────────────────────────────────
  Latency p50 (median)    : 36ms
  Latency p95             : 97ms
  Latency p99             : 118ms
════════════════════════════════════════════════════
```

**Zero errors. Zero crashes. Sub-120ms join latency even at p99.**

## Architecture Notes

- Each `join_room` triggers an `INSERT INTO participants` in PostgreSQL + 4 atomic Redis writes (`SADD`, `HSET` ×2, `EXPIRE` ×2)
- The server broadcasts `player_joined` to all sockets in the room via `namespace.to(pin).emit()`
- Leaderboard scoring uses `ZINCRBY` — O(log N) per answer, race-condition-free
- To scale beyond one server: attach the [Redis adapter](https://socket.io/docs/v4/redis-adapter/) for distributed pub/sub across instances
