import { Request, Response } from 'express';
import pool from '../../db/pool';
import { GameResultsResponse, GameResultEntry } from '../../types';

// GET /api/game/:pin/results
//
// Returns the final leaderboard for a finished game.
// Requires a valid JWT (host or any authenticated user).
//
// Response shape: GameResultsResponse
//   { pin, status, players: [{ playerId, nickname, score, finalRank }] }

export const getGameResults = async (req: Request, res: Response): Promise<void> => {
  const { pin } = req.params;

  try {

    // 1. Look up the game session by PIN
    const sessionResult = await pool.query(`SELECT id, status FROM game_sessions WHERE pin = $1 LIMIT 1`, [pin]);

    if (sessionResult.rows.length === 0) {
      res.status(404).json({ error: 'Game session not found.' });
      return;
    }

    const session = sessionResult.rows[0];

    // 2. Only expose results for finished games.
    //    If the game is still in progress, the client should be reading
    //    real-time data from the WebSocket, not this endpoint.
    if (session.status !== 'game_finished') {
      res.status(409).json({ error: 'Game has not finished yet.' });
      return;
    }

    // 3. Fetch all participants ordered by final_rank ascending (1st place first).
    //    final_rank is written by endQuestion.ts when game_over fires.
    const participantsResult = await pool.query(
      `SELECT id, nickname, score, final_rank FROM participants WHERE session_id = $1 ORDER BY final_rank ASC NULLS LAST`, [session.id]
    );

    const players: GameResultEntry[] = participantsResult.rows.map((row) => ({
      playerId: row.id,
      nickname: row.nickname,
      score: row.score,
      finalRank: row.final_rank ?? null,
    }));

    const response: GameResultsResponse = {
      pin,
      status: session.status,
      players,
    };

    res.status(200).json(response);

  } catch (err) {
    console.error('[getGameResults] Error:', err);
    res.status(500).json({ error: 'Failed to fetch game results.' });
  }
};
