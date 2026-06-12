import { Namespace, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '../../types';
import { handleStartGame } from './startGame';
import { handleSubmitAnswer } from './submitAnswer';
import { advanceToQuestion } from './advanceToQuestion';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

// Re-export advanceToQuestion so existing imports don't break
export { advanceToQuestion };

// handleGame
//
// Registers the two main game events on a socket:
//   - start_game:   host triggers the game to begin
//   - submit_answer: player submits their choice for the current question
export const handleGame = (namespace: GameNamespace, socket: GameSocket): void => {
  handleStartGame(namespace, socket);
  handleSubmitAnswer(namespace, socket);
};
