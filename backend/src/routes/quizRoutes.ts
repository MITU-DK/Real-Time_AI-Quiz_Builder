import { Router } from 'express';
import {
  createQuiz,
  getQuizById,
  getMyQuizzes,
  deleteQuiz,
  generateQuizController,
} from '../controllers/quiz';
import { authenticateToken } from '../middleware/authMiddleware';
import { quizGenerationLimiter } from '../middleware/rateLimiter';

const router = Router();

// All quiz routes are protected — requires a valid JWT
router.use(authenticateToken);

// POST   /api/quizzes/generate — Generate a quiz using Groq AI (rate limited)
router.post('/generate', quizGenerationLimiter, generateQuizController);

// GET    /api/quizzes          — List all quizzes for the logged-in host
router.get('/', getMyQuizzes);

// POST   /api/quizzes          — Save a new quiz with questions (atomic transaction)
router.post('/', createQuiz);

// GET    /api/quizzes/:id      — Get a specific quiz with all its questions
router.get('/:id', getQuizById);

// DELETE /api/quizzes/:id      — Delete a quiz (cascades to questions)
router.delete('/:id', deleteQuiz);

export default router;
