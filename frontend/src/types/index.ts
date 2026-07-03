//  Socket Event Payloads (mirrored from backend) ─

export interface PlayerJoinedPayload {
  playerId: number;
  nickname: string;
  totalPlayers: number;
}

export interface PlayerLeftPayload {
  playerId: number;
  nickname: string;
  totalPlayers: number;
}

export interface QuestionStartPayload {
  questionIndex: number;
  questionText: string;
  options: string[];
  timeLimitSeconds: number;
  points: number;
  tDeadline: number; // absolute UTC ms
}

export interface LeaderboardEntry {
  playerId: number;
  nickname: string;
  score: number;
}

export interface QuestionEndPayload {
  questionIndex: number;
  correctOptionIndex: number;
  leaderboard: LeaderboardEntry[];
}

export interface GameOverPayload {
  finalLeaderboard: LeaderboardEntry[];
}

export interface SyncTimeResponsePayload {
  t0: number;
  t1: number;
  t2: number;
}

export interface JoinedAsHostPayload {
  pin: string;
  totalPlayers: number;
}

export interface ReconciliationPayload {
  currentQuestionIndex: number;
  playerId: number;
  score: number;
  // Present only if player reconnected while a question was actively running
  activeQuestion?: {
    questionText: string;
    options: string[];
    tDeadline: number;  // absolute UTC ms when the question closes
    points: number;
  };
}

//  REST API Types 

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    display_name: string;
  };
}

export interface QuizRow {
  id: number;
  quiz_id: number;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit_seconds: number;
  points: number;
  question_order: number;
  created_at: string;
}

export interface Quiz {
  id: number;
  host_id: number;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
  questions?: QuizRow[];
}

export interface HostGameResponse {
  message: string;
  pin: string;
  sessionId: number;
}

export interface GameResultEntry {
  playerId: number;
  nickname: string;
  score: number;
  finalRank: number | null;
}

export interface GameResultsResponse {
  pin: string;
  status: string;
  players: GameResultEntry[];
}

//  Game State Types 

export type GamePhase =
  | 'idle'
  | 'lobby'
  | 'countdown'
  | 'question'
  | 'results'
  | 'leaderboard'
  | 'game_over';

export interface Player {
  playerId: number;
  nickname: string;
}
