import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getGameResults } from '../controllers/game/results';

const router = Router();

// GET /api/game/:pin/results
// Returns the final leaderboard for a completed game.
// Requires a valid JWT — only authenticated users (hosts) can fetch post-game data.
router.get('/:pin/results', authenticateToken, getGameResults);

export default router;
