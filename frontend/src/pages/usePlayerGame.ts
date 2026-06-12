import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { connectSocket, getSocket } from '../services/socket';
import { useSyncTimer } from '../hooks/useSyncTimer';
import { useGameSocket } from '../hooks/useGameSocket';

export const usePlayerGame = () => {
  const { pin } = useParams<{ pin: string }>();

  // ─── Store selectors
  const phase              = useGameStore((s) => s.phase);
  const currentQuestion    = useGameStore((s) => s.currentQuestion);
  const myAnswer           = useGameStore((s) => s.myAnswer);
  const isLocked           = useGameStore((s) => s.isLocked);
  const correctOptionIndex = useGameStore((s) => s.correctOptionIndex);
  const myScore            = useGameStore((s) => s.myScore);
  const myNickname         = useGameStore((s) => s.myNickname);
  const myPlayerId         = useGameStore((s) => s.myPlayerId);
  const leaderboard        = useGameStore((s) => s.leaderboard);
  const finalLeaderboard   = useGameStore((s) => s.finalLeaderboard);
  const submitAnswer       = useGameStore((s) => s.submitAnswer);
  const setPin             = useGameStore((s) => s.setPin);
  const setMyPlayer        = useGameStore((s) => s.setMyPlayer);
  const setPhase           = useGameStore((s) => s.setPhase);

  const [countdown, setCountdown] = useState<number | null>(null);

  // Registers all socket listeners, removes them on unmount
  useGameSocket();

  const timeRemaining = useSyncTimer();

  // ─── Connect socket and restore credentials on mount
  useEffect(() => {
    if (!pin) return;

    setPin(pin);

    // Restore player identity from localStorage (supports page refresh)
    const storedId       = localStorage.getItem('player_id');
    const storedNickname = localStorage.getItem('player_nickname');
    if (storedId && storedNickname && !myPlayerId) {
      setMyPlayer(parseInt(storedId, 10), storedNickname);
    }

    const socket = connectSocket();

    // Rejoin the room if we have stored credentials (handles page refresh)
    if (storedId && storedNickname) {
      socket.emit('rejoin_room', { playerId: parseInt(storedId, 10), pin });
    }

    // Listen for countdown
    socket.on('show_countdown', () => {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    // NTP clock sync
    getSocket().emit('sync_time', { t0: Date.now() });

    if (phase === 'idle') setPhase('lobby');

    return () => {
      socket.off('show_countdown');
    };
  }, [pin]);

  const wasCorrect = myAnswer === correctOptionIndex;
  const correctOptionText =
    correctOptionIndex !== null && currentQuestion
      ? currentQuestion.options[correctOptionIndex]
      : null;

  return {
    pin,
    phase,
    currentQuestion,
    myAnswer,
    isLocked,
    correctOptionIndex,
    myScore,
    myNickname,
    myPlayerId,
    leaderboard,
    finalLeaderboard,
    submitAnswer,
    timeRemaining,
    wasCorrect,
    correctOptionText,
    countdown
  };
};
