//Game Store (Zustand)
// Pure state store for real-time game data.
// Socket event listeners live separately in hooks/useGameSocket.ts.
// This file only handles state shape and simple setter actions.

import { create } from 'zustand';
import type { GamePhase, Player, LeaderboardEntry, QuestionStartPayload, } from '../types';
import { getSocket } from '../services/socket';

interface GameState {
  //Connection
  phase: GamePhase; //idle,lobby,countdown,question,result,leaderboard,gameover
  pin: string;
  isHost: boolean;

  //Lobby
  players: Player[];  //id,nickname
  totalPlayers: number;

  //Question
  currentQuestion: QuestionStartPayload | null;  //questoin index,text,options,timeLimit,startTime
  tDeadline: number;
  clockOffset: number; // NTP-computed offset (ms)

  //Player answer
  myAnswer: number | null; // selectedOptionIndex
  isLocked: boolean;
  answerCount: number; // how many players have answered current question

  //Results
  correctOptionIndex: number | null;
  leaderboard: LeaderboardEntry[];
  finalLeaderboard: LeaderboardEntry[];

  //Player identity (for player view)
  myPlayerId: number | null;
  myNickname: string;
  myScore: number;

  //set(...) updates Zustand state.nothing to return .
  //Actions
  setPin: (pin: string) => void;
  setIsHost: (isHost: boolean) => void;
  setPhase: (phase: GamePhase) => void;
  setAnswerCount: (count: number) => void;
  setMyPlayer: (playerId: number, nickname: string) => void;
  submitAnswer: (optionIndex: number) => void;
  resetGame: () => void;
}

const initialState = {
  phase: 'idle' as GamePhase,
  pin: '',
  isHost: false,
  players: [] as Player[],
  totalPlayers: 0,
  currentQuestion: null as QuestionStartPayload | null,
  tDeadline: 0,
  clockOffset: 0,
  myAnswer: null as number | null,
  isLocked: false,
  answerCount: 0,
  correctOptionIndex: null as number | null,
  leaderboard: [] as LeaderboardEntry[],
  finalLeaderboard: [] as LeaderboardEntry[],
  myPlayerId: null as number | null,
  myNickname: '',
  myScore: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setPin: (pin) => set({ pin }),
  setIsHost: (isHost) => set({ isHost }),
  setPhase: (phase) => set({ phase }),
  setAnswerCount: (count) => set({ answerCount: count }),
  setMyPlayer: (playerId, nickname) => set({ myPlayerId: playerId, myNickname: nickname }),

  submitAnswer: (optionIndex) => {
    const state = get();

    const pin = state.pin;
    const isLocked = state.isLocked;

    if (isLocked) return;

    const socket = getSocket();
    const currentQ = get().currentQuestion;
    if (!currentQ) return;

    socket.emit('submit_answer', {
      pin,
      questionIndex: currentQ.questionIndex, selectedOptionIndex: optionIndex,
    });

    set({ myAnswer: optionIndex, isLocked: true });

  },

  resetGame: () => set({ ...initialState }),

}));
