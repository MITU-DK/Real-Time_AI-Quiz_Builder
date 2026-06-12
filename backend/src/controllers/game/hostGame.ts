import { Request, Response } from 'express';
import pool from '../../db/pool';

// POST /api/game/host
//
// Accepts a quizId. Generates a random 6-digit PIN and creates
// a new game_session in the database, returning the PIN so the
// host can share it with players and join the Socket.IO room.

// Helper function to generate a random 6-digit PIN (e.g. "492015")
const generatePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hostGame = async (req: Request, res: Response): Promise<void> => {
  const { quizId } = req.body;
  const hostId = req.user!.userId; // from authenticateToken middleware

  if (!quizId) {
    res.status(400).json({ error: 'quizId is required.' });
    return;
  }

  try {
    // 1. Verify the quiz exists and belongs to the host
    const quizResult = await pool.query(
      `SELECT id FROM quizzes WHERE id = $1 AND host_id = $2 LIMIT 1`, [quizId, hostId]
    );

    if (quizResult.rows.length === 0) {
      res.status(404).json({ error: 'Quiz not found or you do not own it.' });
      return;
    }

    // 2. Generate a unique PIN
    // In a real app we'd loop if the PIN is already active, but a collision
    // on a 6-digit number for simultaneous active games is low for this project.
    const pin = generatePin();

    // 3. Insert the game session
    const sessionResult = await pool.query(
      `INSERT INTO game_sessions (quiz_id, host_id, pin, status)
       VALUES ($1, $2, $3, 'lobby_waiting') RETURNING *`, [quizId, hostId, pin]
    );

    const newSession = sessionResult.rows[0];

    // 4. Return the PIN to the host
    res.status(201).json({
      message: 'Game session created successfully.',
      pin: newSession.pin, sessionId: newSession.id,
    });

  } catch (error: any) {
    console.error('[hostGame] Error creating game session:', error);
    res.status(500).json({ error: 'An error occurred while creating the game session.' });
  }
};
