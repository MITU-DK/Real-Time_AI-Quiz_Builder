import { Request, Response } from "express";
import pool from "../../db/pool";
import { QuizRow, QuestionRow, QuizWithQuestions } from "../../types";

export const getQuizById = async (req: Request, res: Response): Promise<void> => {

  const quizId = parseInt(req.params.id, 10);
  const hostId = req.user!.userId;

  if (isNaN(quizId)) {
    res.status(400).json({ error: "Invalid quiz ID." });
    return;
  }

  try {
    const quizResult = await pool.query<QuizRow>(
      "SELECT * FROM quizzes WHERE id = $1 AND host_id = $2", [quizId, hostId]);

    if (quizResult.rowCount === 0) {
      res.status(404).json({ error: "Quiz not found." });
      return;
    }

    const quiz = quizResult.rows[0]; // <QuizRow> dictionary------*******(id,host_id,title,topic,difficulty,created_at,updated_at)

    const questionsResult = await pool.query<QuestionRow>(
      "SELECT * FROM questions WHERE quiz_id = $1 ORDER BY question_order ASC", [quizId]);

    const response: QuizWithQuestions = { ...quiz, questions: questionsResult.rows, };

    res.status(200).json(response);
  }
  catch (error) {
    console.error("[Quiz] Get by ID error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
