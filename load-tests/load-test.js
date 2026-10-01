/**
 * load-test.js — Custom Socket.IO load tester for QuizArena
 *
 * Usage:
 *   TEST_PIN=518907 node load-tests/load-test.js
 *
 * What it does:
 *   - Ramps up to MAX_USERS concurrent Socket.IO connections
 *   - Each client connects to /game namespace and emits join_room
 *   - Tracks success/fail, latency p50/p95/p99, and peak concurrent connections
 *   - Prints a summary table at the end
 */

const { io } = require('../backend/node_modules/socket.io-client');

// ── Config ────────────────────────────────────────────────────────────────────
const TARGET       = process.env.TARGET_URL || 'http://localhost:3001';
const PIN          = process.env.TEST_PIN;
const MAX_USERS    = parseInt(process.env.MAX_USERS  || '500', 10);
const RAMP_SECS    = parseInt(process.env.RAMP_SECS  || '30',  10);  // ramp-up duration
const HOLD_SECS    = parseInt(process.env.HOLD_SECS  || '30',  10);  // hold at peak
const BATCH_SIZE   = Math.ceil(MAX_USERS / RAMP_SECS);               // connections/sec

if (!PIN) {
  console.error('❌  TEST_PIN env variable is required.\n    Usage: TEST_PIN=123456 node load-tests/load-test.js');
  process.exit(1);
}

// ── Metrics ───────────────────────────────────────────────────────────────────
let launched = 0, connected = 0, joinedLobby = 0, errors = 0;
let peakConcurrent = 0;
const latencies = [];   // join_room round-trip times (ms)
const clients   = [];
const startedAt = Date.now();

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function printProgress() {
  process.stdout.write(
    `\r  Connected: ${connected}  |  Joined lobby: ${joinedLobby}  |  Errors: ${errors}  |  Peak: ${peakConcurrent}   `
  );
}

// ── Spawn one virtual user ────────────────────────────────────────────────────
function spawnUser(id) {
  return new Promise((resolve) => {
    const nickname = `LoadBot_${id}`;
    const socket = io(`${TARGET}/game`, {
      transports: ['websocket'],
      reconnection: false,
      timeout: 10000,
    });

    clients.push(socket);

    socket.on('connect', () => {
      connected++;
      peakConcurrent = Math.max(peakConcurrent, connected);
      printProgress();

      const t0 = Date.now();
      socket.emit('join_room', { pin: PIN, nickname });

      socket.once('player_joined', () => {
        joinedLobby++;
        latencies.push(Date.now() - t0);
        printProgress();
        resolve('ok');
      });

      socket.once('error', (msg) => {
        errors++;
        printProgress();
        resolve('error: ' + msg);
      });
    });

    socket.on('connect_error', (err) => {
      errors++;
      printProgress();
      resolve('connect_error: ' + err.message);
    });

    // Safety timeout
    setTimeout(() => resolve('timeout'), 15000);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  QuizArena Load Test`);
  console.log(`    Target  : ${TARGET}`);
  console.log(`    PIN     : ${PIN}`);
  console.log(`    Users   : ${MAX_USERS}`);
  console.log(`    Ramp-up : ${RAMP_SECS}s  |  Hold: ${HOLD_SECS}s`);
  console.log(`────────────────────────────────────────────────────\n`);

  // Ramp-up: spawn BATCH_SIZE users every second
  for (let sec = 0; sec < RAMP_SECS && launched < MAX_USERS; sec++) {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE && launched < MAX_USERS; i++) {
      launched++;
      batch.push(spawnUser(launched));
    }
    // Don't await — fire and forget for concurrency
    batch.forEach(p => p.catch(() => {}));
    await sleep(1000);
  }

  console.log(`\n\n⏳  Peak reached (${connected} connected). Holding for ${HOLD_SECS}s...`);
  await sleep(HOLD_SECS * 1000);

  // Disconnect all
  console.log('\n🔌  Disconnecting all clients...');
  clients.forEach(s => s.disconnect());
  await sleep(2000);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
  const successRate = launched > 0 ? ((joinedLobby / launched) * 100).toFixed(1) : 0;

  console.log('\n\n════════════════════════════════════════════════════');
  console.log('  📊  LOAD TEST RESULTS');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Total users launched    : ${launched}`);
  console.log(`  Sockets connected       : ${connected}`);
  console.log(`  Successfully joined     : ${joinedLobby}`);
  console.log(`  Errors                  : ${errors}`);
  console.log(`  Peak concurrent conns   : ${peakConcurrent}`);
  console.log(`  Success rate            : ${successRate}%`);
  console.log(`  Test duration           : ${duration}s`);
  console.log('────────────────────────────────────────────────────');
  console.log(`  Latency p50 (median)    : ${percentile(latencies, 50)}ms`);
  console.log(`  Latency p95             : ${percentile(latencies, 95)}ms`);
  console.log(`  Latency p99             : ${percentile(latencies, 99)}ms`);
  console.log('════════════════════════════════════════════════════\n');

  // Save results to JSON
  const results = {
    timestamp: new Date().toISOString(),
    config: { target: TARGET, pin: PIN, maxUsers: MAX_USERS, rampSecs: RAMP_SECS, holdSecs: HOLD_SECS },
    results: {
      launched, connected, joinedLobby, errors, peakConcurrent, successRate: parseFloat(successRate), durationSecs: parseFloat(duration),
      latency: { p50: percentile(latencies, 50), p95: percentile(latencies, 95), p99: percentile(latencies, 99) }
    }
  };

  require('fs').writeFileSync('./load-tests/results.json', JSON.stringify(results, null, 2));
  console.log('  💾  Results saved to load-tests/results.json\n');

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
