//Types Barrel Single import point for the entire backend.
// All handlers, controllers, and routes import from '../../types' (or '../types')
// and this file re-exports everything transparently.

// Files:
//   db.types.ts     — PostgreSQL row shapes (UserRow, QuizRow, QuestionRow, ...)
//   api.types.ts    — REST request bodies, response shapes, JWT payload
//   socket.types.ts — Socket.IO event contracts, payloads, SocketData

export * from './db.types';
export * from './api.types';
export * from './socket.types';
