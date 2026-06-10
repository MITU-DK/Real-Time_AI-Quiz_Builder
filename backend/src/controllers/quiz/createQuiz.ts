import { Request, Response } from "express";
import pool from "../../db/pool";
import { CreateQuizRequestBody, QuizRow, QuestionRow } from "../../types";

export const createQuiz = async (req: Request, res: Response): Promise<void> => {

  const { title, topic, difficulty, questions } = req.body as CreateQuizRequestBody;
  const hostId = req.user!.userId;

  if (!title || !topic || !difficulty) {
    res.status(400).json({ error: "title, topic, and difficulty are required." });
    return;
  }

  if (!Array.isArray(questions) || questions.length === 0) {  //check is quesstions argument, is an array or not? & length>0.
    res.status(400).json({ error: "At least one question is required." });
    return;
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    if (!q.question_text || !Array.isArray(q.options) || q.options.length !== 4 ||
      q.correct_option_index === undefined || q.correct_option_index < 0 || q.correct_option_index > 3) {

      res.status(400).json({
        error: `Question at index ${i} is invalid. Each question must have question_text, exactly 4 options, and a correct_option_index (0-3).`,
      });
      return;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // begin transaction, which means that either all queries will succeed or all queries will be rolled back.

    const quizResult = await client.query<QuizRow>(
      `INSERT INTO quizzes (host_id, title, topic, difficulty)
       VALUES ($1, $2, $3, $4) RETURNING *`, [hostId, title, topic, difficulty]
    );
    const newQuiz = quizResult.rows[0];  // its a quizrow table dictionary------******(id,host_id,title,topic,difficulty,created_at,updated_at)

    const insertedQuestions: QuestionRow[] = [];

    for (let i = 0; i < questions.length; i++) {

      const q = questions[i];

      const questionResult = await client.query<QuestionRow>(
        `INSERT INTO questions
           (quiz_id, question_text, options, correct_option_index, time_limit_seconds, points, question_order)
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
         RETURNING *`,
        [newQuiz.id, q.question_text, JSON.stringify(q.options), q.correct_option_index, q.time_limit_seconds ?? 20, q.points ?? 200, i,]
      );

      insertedQuestions.push(questionResult.rows[0]);

    }

    await client.query("COMMIT"); // commit transaction, which means that all queries have been succeeded.

    res.status(201).json({
      message: "Quiz created successfully.",
      quiz: { ...newQuiz, questions: insertedQuestions, },
    });
  }

  catch (error) {
    await client.query("ROLLBACK"); // rollback  to undo the changes made in the transaction
    console.error("[Quiz] Create error, transaction rolled back:", error);
    res.status(500).json({ error: "Failed to create quiz. All changes have been rolled back.", });
  }

  finally {
    client.release();
  }
};
