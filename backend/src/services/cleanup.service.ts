import { redis } from '../config/redis';

// cleanupGame
//
// Called once when a game transitions to GAME_OVER.
// Deletes all transient Redis keys associated with the game so memory
// is not leaked between game sessions.
//
// Keys deleted:
//   session:{pin}:state      - the active question state hash
//   session:{pin}:leaderboard - the sorted set of player scores
//   room:{pin}:presence       - the set of connected playerIds
//   player:{playerId}:meta    - nickname lookup hash for each player
//
// We do NOT delete socket:{socketId} hashes here because sockets may
// still be connected and those keys are cleaned up by disconnect.handler.ts.

export const cleanupGame = async (pin: string, playerIds: number[]): Promise<void> => {

  const keysToDelete: string[] = [
    `session:${pin}:state`,
    `session:${pin}:leaderboard`,
    `room:${pin}:presence`,
    // one key per player
    ...playerIds.map((id) => `player:${id}:meta`),
  ];

  // DEL accepts multiple keys in a single round-trip
  await redis.del(...keysToDelete);

  console.log(`[Cleanup] Purged ${keysToDelete.length} Redis keys for room ${pin}.`);
};
