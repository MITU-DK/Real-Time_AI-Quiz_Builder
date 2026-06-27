import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useSyncTimer } from '../hooks/useSyncTimer';
import { useGameSocket } from '../hooks/useGameSocket';

export const useHostGame = () => {
  const { pin } = useParams<{ pin: string }>();

  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const totalPlayers = useGameStore((s) => s.totalPlayers);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const correctOptionIndex = useGameStore((s) => s.correctOptionIndex);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const finalLeaderboard = useGameStore((s) => s.finalLeaderboard);
  const answerCount = useGameStore((s) => s.answerCount);
  const setPin = useGameStore((s) => s.setPin);
  const setIsHost = useGameStore((s) => s.setIsHost);
  const resetGame = useGameStore((s) => s.resetGame);

  useGameSocket();

  const user = useAuthStore((s) => s.user);
  const timeRemaining = useSyncTimer();

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!pin || !user) return;

    // Clear all stale state from any previous game before joining a new one.
    resetGame();

    setPin(pin);
    setIsHost(true);

    const socket = connectSocket();

    socket.emit('join_as_host', { pin, hostId: user.id });
    socket.emit('sync_time', { t0: Date.now() });

    return () => {
      disconnectSocket();
    };
  }, [pin, user]);

  const handleStartGame = () => {
    getSocket().emit('trigger_countdown', { pin });
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setCountdown(null);
          getSocket().emit('start_game', { pin });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return {
    pin,
    phase,
    players,
    totalPlayers,
    currentQuestion,
    correctOptionIndex,
    leaderboard,
    finalLeaderboard,
    countdown,
    answerCount,
    timeRemaining,
    handleStartGame
  };
};
