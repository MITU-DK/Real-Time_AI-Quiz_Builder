import { Router } from "express";
import {
  createQuiz,
  getQuizById,
  getMyQuizzes,
  deleteQuiz,
} from "../controllers/quiz";
import { authenticateToken } from "../middleware/authMiddleware";
import { generateQuiz } from "../services/ai.service";
import { quizGenerationLimiter } from "../middleware/rateLimiter";

const router = Router();

// All quiz routes are protected — requires a valid JWT
router.use(authenticateToken);    //applies the middleware to all routes defined after it

// POST   /api/quizzes/generate — Generate a quiz using Groq AI
router.post("/generate", quizGenerationLimiter, async (req, res) => {
  const { topic, difficulty } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ error: "Both topic and difficulty are required." });
  }

  try {
    const quizData = await generateQuiz(topic, difficulty);
    return res.status(201).json(quizData);
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ error: "An error occurred while generating the quiz." });
  }
});

// GET    /api/quizzes       — List all quizzes for the logged-in host
router.get("/", getMyQuizzes);

// POST   /api/quizzes       — Create a new quiz with questions (atomic transaction)
router.post("/", createQuiz);

// GET    /api/quizzes/:id   — Get a specific quiz with all its questions
router.get("/:id", getQuizById);

// DELETE /api/quizzes/:id   — Delete a quiz (cascades to questions)
router.delete("/:id", deleteQuiz);

export default router;
