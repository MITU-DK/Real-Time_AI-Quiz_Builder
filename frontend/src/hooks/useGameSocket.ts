// Custom hook that owns all Socket.IO event listeners for a game session.
// Registers listeners on mount, removes them on unmount.
// Calls useGameStore actions to update shared state when events arrive.
//
// Usage: call once at the top of HostGamePage or PlayerGamePage.

import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useGameStore } from '../store/useGameStore';
import type {
  PlayerJoinedPayload,
  PlayerLeftPayload,
  QuestionStartPayload,
  QuestionEndPayload,
  GameOverPayload,
  SyncTimeResponsePayload,
} from '../types';

export const useGameSocket = () => {
  useEffect(() => {
    const socket = getSocket();

    //Lobby: player joined / left
    socket.on('player_joined', (data: PlayerJoinedPayload) => {
      useGameStore.setState((state) => ({
        players: [
          ...state.players.filter((p) => p.playerId !== data.playerId),
          { playerId: data.playerId, nickname: data.nickname },
        ],
        totalPlayers: data.totalPlayers,
      }));
    });

    socket.on('player_left', (data: PlayerLeftPayload) => {
      useGameStore.setState((state) => ({
        players: state.players.filter((p) => p.playerId !== data.playerId),
        totalPlayers: data.totalPlayers,
      }));
    });

    //NTP clock sync
    socket.on('sync_time_response', (data: SyncTimeResponsePayload) => {
      const t3 = Date.now();
      const offset = ((data.t1 - data.t0) + (data.t2 - t3)) / 2;
      useGameStore.setState({ clockOffset: offset });
    });

    //Game loop: new question arrives
    socket.on('question_start', (data: QuestionStartPayload) => {
      useGameStore.setState({
        phase: 'question',
        currentQuestion: data,
        tDeadline: data.tDeadline,
        myAnswer: null,
        isLocked: false,
        correctOptionIndex: null,
      });
    });

    //Game loop: question ends, show results then auto-transition to leaderboard
    socket.on('question_end', (data: QuestionEndPayload) => {
      const myId = useGameStore.getState().myPlayerId;
      const myEntry = data.leaderboard.find((e) => e.playerId === myId);

      useGameStore.setState({
        phase: 'results',
        correctOptionIndex: data.correctOptionIndex,
        leaderboard: data.leaderboard,
        myScore: myEntry?.score ?? useGameStore.getState().myScore,
      });

      // Auto-advance to leaderboard view after 3 seconds
      setTimeout(() => {
        if (useGameStore.getState().phase === 'results') {
          useGameStore.setState({ phase: 'leaderboard' });
        }
      }, 3000);

    });

    //Game over
    socket.on('game_over', (data: GameOverPayload) => {
      useGameStore.setState({
        phase: 'game_over',
        finalLeaderboard: data.finalLeaderboard,
      });
    });

    //Host confirmation
    socket.on('joined_as_host', (data: { totalPlayers: number }) => {
      useGameStore.setState({ totalPlayers: data.totalPlayers, phase: 'lobby' });
    });

    //Error
    socket.on('error', (message: string) => {
      console.error('[Socket Error]', message);
    });

    //Cleanup: remove all listeners when the page unmounts
    return () => {
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('sync_time_response');
      socket.off('question_start');
      socket.off('question_end');
      socket.off('game_over');
      socket.off('joined_as_host');
      socket.off('error');
    };
  },
    []); // runs once per mount — socket listeners not re-registered on every render
};
