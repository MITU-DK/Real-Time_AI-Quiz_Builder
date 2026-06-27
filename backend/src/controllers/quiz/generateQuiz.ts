import { Request, Response } from 'express';
import { generateQuiz } from '../../services/ai.service';

// POST /api/quizzes/generate
// Accepts a topic and difficulty, calls the Groq AI service, and returns
// the generated quiz JSON for the host to review before saving.
export const generateQuizController = async (req: Request, res: Response): Promise<void> => {

  const { topic, difficulty, numQuestions } = req.body;

  if (!topic || !difficulty) {
    res.status(400).json({ error: 'Both topic and difficulty are required.' });
    return;
  }

  const count = typeof numQuestions === 'number' && numQuestions > 0 ? numQuestions : 5;

  try {
    const quizData = await generateQuiz(topic, difficulty, count);
    res.status(201).json(quizData);
  } catch (error: any) {
    console.error('[generateQuizController] Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the quiz.' });
  }

};
