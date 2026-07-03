//  Socket.IO Types 
// All event contracts and payload shapes for the /game WebSocket namespace.

//Phase 3: Lobby Payloads 

// Player joins the lobby by entering a PIN and nickname
export interface JoinRoomPayload {
  pin: string;
  nickname: string;
  playerId?: number; // present when rejoining after a disconnect
}

// Server → room: a new player has appeared in the lobby
export interface PlayerJoinedPayload {
  playerId: number;
  nickname: string;
  totalPlayers: number;
}

// Server → room: a player has left (disconnect/timeout)
export interface PlayerLeftPayload {
  playerId: number;
  nickname: string;
  totalPlayers: number;
}
// Server → all clients: a question is now active
export interface QuestionStartPayload {
  questionIndex: number;
  questionText: string;
  options: string[];               // 4 answer strings (correct one is NOT flagged)
  timeLimitSeconds: number;
  points: number;                  // max possible score for this question
  tDeadline: number;               // absolute UTC millisecond when answers stop being accepted
}

// One row in the leaderboard (used in QuestionEndPayload and GameOverPayload)
export interface LeaderboardEntry {
  playerId: number;
  nickname: string;
  score: number;
}
export interface SyncTimeResponsePayload {
  t0: number; // echoed back so the client can compute round-trip time
  t1: number; // server timestamp at ingestion (ms)
  t2: number; // server timestamp just before sending the reply (ms)
}
// Server → host only: confirmed they have joined the room
export interface JoinedAsHostPayload {
  pin: string;
  totalPlayers: number; // players already in the lobby at the time of host join
}


// Server → reconnecting player: their current game state snapshot
export interface ReconciliationPayload {
  currentQuestionIndex: number;
  playerId: number;
  score: number;
  // Present only if a question is currently active (player reconnected mid-question)
  activeQuestion?: {
    questionText: string;
    options: string[];
    tDeadline: number;   // absolute UTC ms when this question closes
    points: number;      // max points for this question
  };
}

// ─── Phase 4: Game Loop Payloads 

// NTP Clock Sync — client sends t0, server echoes back with t1 and t2.
// Client computes offset = ((t1 - t0) + (t2 - t3)) / 2 to align its visual timer.
export interface SyncTimePayload {
  t0: number; // client's local timestamp at send time (ms)
}

// Host joining the WebSocket room (separate event from player join)
export interface JoinAsHostPayload {
  pin: string;
  hostId: number; // must match game_sessions.host_id in the DB
}


// Player submitting their answer for the current question
export interface SubmitAnswerPayload {
  pin: string;
  questionIndex: number;           // guards against stale submissions for the wrong question
  selectedOptionIndex: 0 | 1 | 2 | 3;
}

// Server → all clients: a question has closed
export interface QuestionEndPayload {
  questionIndex: number;
  correctOptionIndex: number;
  leaderboard: LeaderboardEntry[]; // sorted highest score first
}

// Server → all clients: the entire game is over
export interface GameOverPayload {
  finalLeaderboard: LeaderboardEntry[];
}

// ─── Socket.IO Event Maps
// These are the typed contracts passed to the Socket.IO Server constructor.

// Events CLIENTS send TO the server
export interface ClientToServerEvents {
  // Phase 3
  join_room: (payload: JoinRoomPayload) => void;
  rejoin_room: (payload: { playerId: number; pin: string }) => void;

  // Phase 4
  join_as_host: (payload: JoinAsHostPayload) => void;   // host enters the socket room
  sync_time: (payload: SyncTimePayload) => void;     // NTP clock handshake
  start_game: (payload: { pin: string }) => void;     // host requests the game to start (backend owns the countdown)
  submit_answer: (payload: SubmitAnswerPayload) => void; // player submits their choice
}

// Events the SERVER sends TO clients
export interface ServerToClientEvents {
  // Phase 3 — lobby presence
  player_joined: (data: PlayerJoinedPayload) => void;
  player_left: (data: PlayerLeftPayload) => void;
  reconciled: (data: ReconciliationPayload) => void;
  error: (message: string) => void;

  // Phase 4 — game loop
  joined_as_host: (data: JoinedAsHostPayload) => void;
  show_countdown: (data: { tDeadline: number }) => void; // absolute UTC ms when countdown ends
  sync_time_response: (data: SyncTimeResponsePayload) => void;
  answer_count_updated: (data: { answerCount: number }) => void;
  question_start: (data: QuestionStartPayload) => void;
  question_end: (data: QuestionEndPayload) => void;
  game_over: (data: GameOverPayload) => void;
}

// ─── Socket Metadata 
// Data stored on each socket instance (socket.data).
// Set during join_room (player) or join_as_host (host).

export interface SocketData {
  playerId: number;
  pin: string;
  nickname: string;
  hostId?: number; // only set if the socket belongs to the quiz host
}
