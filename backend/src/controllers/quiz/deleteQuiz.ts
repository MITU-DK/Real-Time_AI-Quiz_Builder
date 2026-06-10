import { Request, Response } from "express";
import pool from "../../db/pool";

export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {

  const quizId = parseInt(req.params.id, 10); //get quizid from url ,10-->treat as decimal & syntax: parseInt(value,radix=10)
  const hostId = req.user!.userId;            //get hostid from jwt token

  if (isNaN(quizId)) {                //check if quizid is a number
    res.status(400).json({ error: "Invalid quiz ID." });
    return;
  }

  try {
    const result = await pool.query(
      "DELETE FROM quizzes WHERE id = $1 AND host_id = $2 RETURNING id", [quizId, hostId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Quiz not found." });
      return;
    }

    res.status(200).json({ message: "Quiz deleted successfully." });
  }

  catch (error) {
    console.error("[Quiz] Delete error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
