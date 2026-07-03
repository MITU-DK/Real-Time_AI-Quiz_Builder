import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { connectSocket, getSocket } from '../services/socket';
import { useSyncTimer } from '../hooks/useSyncTimer';
import { useGameSocket } from '../hooks/useGameSocket';

export const usePlayerGame = () => {
  const { pin } = useParams<{ pin: string }>();

  const phase = useGameStore((s) => s.phase);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const myAnswer = useGameStore((s) => s.myAnswer);
  const isLocked = useGameStore((s) => s.isLocked);
  const correctOptionIndex = useGameStore((s) => s.correctOptionIndex);
  const myScore = useGameStore((s) => s.myScore);
  const myNickname = useGameStore((s) => s.myNickname);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const finalLeaderboard = useGameStore((s) => s.finalLeaderboard);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const setPin = useGameStore((s) => s.setPin);
  const setMyPlayer = useGameStore((s) => s.setMyPlayer);
  const setPhase = useGameStore((s) => s.setPhase);

  const [countdown, setCountdown] = useState<number | null>(null);

  // Registers all socket listeners, removes them on unmount
  useGameSocket();

  const timeRemaining = useSyncTimer();

  // Connect socket and restore credentials on mount
  useEffect(() => {
    if (!pin) return;

    setPin(pin);

    // Restore player identity from sessionStorage (supports page refresh, isolates tabs)
    const storedId = sessionStorage.getItem('player_id');
    const storedNickname = sessionStorage.getItem('player_nickname');
    if (storedId && storedNickname && !myPlayerId) {//It prevents the app from doing extra, useless work if it already knows who the player is!
      setMyPlayer(parseInt(storedId, 10), storedNickname);
    }

    const socket = connectSocket();

    // Rejoin the room if we have stored credentials (handles page refresh)
    if (storedId && storedNickname) {
      socket.emit('rejoin_room', { playerId: parseInt(storedId, 10), pin });
    }

    // Listen for countdown — tDeadline comes from the backend so all phones are perfectly in sync
    socket.on('show_countdown', ({ tDeadline }) => {
      const tick = () => {
        const secsLeft = Math.ceil((tDeadline - Date.now()) / 1000);
        if (secsLeft <= 0) {
          setCountdown(null);
        } else {
          setCountdown(secsLeft);
          setTimeout(tick, 200); // re-check every 200ms so a lagging phone self-corrects instantly
        }
      };
      tick(); // run once immediately so the number appears without a 200ms delay
    });

    // NTP clock sync
    socket.emit('sync_time', { t0: Date.now() });

    if (phase === 'idle') setPhase('lobby');

    return () => {
      socket.off('show_countdown');
    };
  }, [pin]);

  const wasCorrect = myAnswer === correctOptionIndex;
  const correctOptionText =
    correctOptionIndex !== null && currentQuestion ? currentQuestion.options[correctOptionIndex] : null;

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
