// ─── Database Row Types ───────────────────────────────────────────────────────
// These mirror the exact column shapes returned by PostgreSQL queries (pg rows).

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
  difficulty: 'easy' | 'medium' | 'hard';
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
  status: 'lobby_waiting' | 'in_progress' | 'game_finished';
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
