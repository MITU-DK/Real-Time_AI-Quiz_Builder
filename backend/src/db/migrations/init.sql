-- Initial Database Schema

-- Enable UUID extension for robust ID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE 1: users
-- Stores host accounts. Passwords are stored as bcrypt hashes.
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 2: quizzes
-- Template metadata. Links to the user who created it.
CREATE TABLE IF NOT EXISTS quizzes (
  id          SERIAL PRIMARY KEY,
  host_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  topic       VARCHAR(255) NOT NULL,
  difficulty  VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 3: questions
-- refernce only with  quiz.
-- options is a JSONB array of exactly 4 strings. 
CREATE TABLE IF NOT EXISTS questions (
  id                  SERIAL PRIMARY KEY,
  quiz_id             INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text       TEXT NOT NULL,
  options             JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
  time_limit_seconds  INTEGER NOT NULL DEFAULT 20 CHECK (time_limit_seconds IN (10, 20, 30)),
  points              INTEGER NOT NULL DEFAULT 200 CHECK (points IN (100, 200, 500, 1000)),
  question_order      INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 4: game_sessions
-- Represents an active live game event.
-- pin is the 6-character code players use to join.
CREATE TABLE IF NOT EXISTS game_sessions (
  id          SERIAL PRIMARY KEY,
  quiz_id     INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  host_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pin         CHAR(6) NOT NULL UNIQUE,
  status      VARCHAR(30) NOT NULL DEFAULT 'lobby_waiting'
                CHECK (status IN ('lobby_waiting', 'in_progress', 'game_finished')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 5: participants
-- Anonymous player profiles linked to a game session by PIN.
-- Tracks nickname and accumulated points.
CREATE TABLE IF NOT EXISTS participants (
  id          SERIAL PRIMARY KEY,
  session_id  INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  nickname    VARCHAR(50) NOT NULL,
  score       INTEGER NOT NULL DEFAULT 0,
  final_rank  INTEGER,                        -- set at game_over (1 = winner), NULL during play
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensures no duplicate nicknames within the same session
  UNIQUE (session_id, nickname)
);

-- TABLE 6: responses
-- Stores each player's individual answer per question.
-- Used by the async write-behind worker.
CREATE TABLE IF NOT EXISTS responses (
  id                  SERIAL PRIMARY KEY,
  session_id          INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id      INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id         INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL CHECK (selected_option_index BETWEEN 0 AND 3),
  is_correct          BOOLEAN NOT NULL,
  response_time_ms    INTEGER NOT NULL, -- milliseconds from question start
  points_awarded      INTEGER NOT NULL DEFAULT 0,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One answer per player per question
  UNIQUE (participant_id, question_id)
);

-- INDEXES: Optimize high-frequency lookup queries

-- Fast lookup by session PIN (used on every player join event)
CREATE INDEX IF NOT EXISTS idx_game_sessions_pin ON game_sessions(pin);

-- Fast lookup of all questions belonging to a quiz
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);

-- Fast lookup of all quizzes created by a specific host
CREATE INDEX IF NOT EXISTS idx_quizzes_host_id ON quizzes(host_id);

-- Fast lookup of participants in a session
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON participants(session_id);

-- Fast lookup of responses per session (for batch writes)
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
