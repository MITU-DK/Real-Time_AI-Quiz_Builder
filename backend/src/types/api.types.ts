import { QuizRow, QuestionRow } from './db.types';

// ─── API Request Body Types ───────────────────────────────────────────────────

export interface RegisterRequestBody {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface CreateQuestionInput {
  question_text: string;
  options: [string, string, string, string]; // Exactly 4 options
  correct_option_index: 0 | 1 | 2 | 3;
  time_limit_seconds?: 10 | 20 | 30;
  points?: 100 | 200 | 500 | 1000;
}

export interface CreateQuizRequestBody {
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: CreateQuestionInput[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

// A quiz fetched with all its questions nested inside (GET /api/quizzes/:id)
export interface QuizWithQuestions extends QuizRow {
  questions: QuestionRow[];
}

// One player's final result returned by GET /api/game/:pin/results
export interface GameResultEntry {
  playerId: number;
  nickname: string;
  score: number;
  finalRank: number | null;
}

// Full response shape for GET /api/game/:pin/results
export interface GameResultsResponse {
  pin: string;
  status: string;
  players: GameResultEntry[];
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: number;
  email: string;
}

// Extends Express's Request object to include the decoded JWT payload.
// Populated by the authenticateToken middleware after verifying the JWT.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
