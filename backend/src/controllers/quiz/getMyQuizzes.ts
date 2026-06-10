import { Request, Response } from "express";
import pool from "../../db/pool";
import { QuizRow } from "../../types";

export const getMyQuizzes = async (req: Request, res: Response): Promise<void> => {

  const hostId = req.user!.userId;

  try {
    const result = await pool.query<QuizRow>(
      "SELECT * FROM quizzes WHERE host_id = $1 ORDER BY created_at DESC", [hostId]);

    res.status(200).json({ quizzes: result.rows });
  }
  catch (error) {
    console.error("[Quiz] Get my quizzes error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
