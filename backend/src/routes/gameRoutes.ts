import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getGameResults } from '../controllers/game/results';
import { hostGame } from '../controllers/game/hostGame';

const router = Router();

// POST /api/game/host
// Accepts { "quizId": number }. Generates a PIN and creates a live game session.
// Requires a valid JWT (must be the owner of the quiz).
router.post('/host', authenticateToken, hostGame);

// GET /api/game/:pin/results
// Returns the final leaderboard for a completed game.
// Requires a valid JWT.
router.get('/:pin/results', authenticateToken, getGameResults);

export default router;
