// Shared TypeScript types for the entire backend

// Database Row Types
export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuizRow {
  id: number;
  host_id: number;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  created_at: Date;
  updated_at: Date;
}

export interface QuestionRow {
  id: number;
  quiz_id: number;
  question_text: string;
  options: string[]; // JSONB array of exactly 4 strings
  correct_option_index: number;
  time_limit_seconds: number;
  points: number;
  question_order: number;
  created_at: Date;
}

export interface GameSessionRow {
  id: number;
  quiz_id: number;
  host_id: number;
  pin: string;
  status: "lobby_waiting" | "in_progress" | "game_finished";
  current_question_index: number;
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
}

export interface ParticipantRow {
  id: number;
  session_id: number;
  nickname: string;
  score: number;
  joined_at: Date;
}

// API Request Body Types
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
  difficulty: "easy" | "medium" | "hard";
  questions: CreateQuestionInput[];
}

// API Response Types
export interface QuizWithQuestions extends QuizRow {
  questions: QuestionRow[];
}

//JWT Payload
export interface JwtPayload {
  userId: number;
  email: string;
}

// Express Request Extension
// Allows req.user to be set after JWT middleware validates a token
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
