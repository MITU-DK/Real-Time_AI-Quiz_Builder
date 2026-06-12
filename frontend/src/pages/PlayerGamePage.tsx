// ─── PlayerGamePage ───────────────────────────────────────────────────────────
// Orchestrates the player side of a live quiz game.
// Reconnects to the socket, restores credentials from localStorage, then
// delegates rendering to focused sub-components based on the current game phase.

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { connectSocket, getSocket } from '../services/socket';
import { useSyncTimer } from '../hooks/useSyncTimer';
import { useGameSocket } from '../hooks/useGameSocket';

// ─── Sub-views
import WaitingView     from '../components/player/WaitingView';
import BuzzerView      from '../components/player/BuzzerView';
import LockedView      from '../components/player/LockedView';
import ResultView      from '../components/player/ResultView';
import LeaderboardView from '../components/player/LeaderboardView';
import GameOverView    from '../components/player/GameOverView';

const PlayerGamePage = () => {
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
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const setPin       = useGameStore((s) => s.setPin);
  const setMyPlayer  = useGameStore((s) => s.setMyPlayer);
  const setPhase     = useGameStore((s) => s.setPhase);

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

    // NTP clock sync
    getSocket().emit('sync_time', { t0: Date.now() });

    if (phase === 'idle') setPhase('lobby');
  }, [pin]);

  // ─── Phase-based rendering

  if (phase === 'idle' || phase === 'lobby') {
    return <WaitingView nickname={myNickname} />;
  }

  if (phase === 'question' && currentQuestion) {
    if (isLocked) {
      return <LockedView myAnswer={myAnswer!} question={currentQuestion} />;
    }
    return <BuzzerView question={currentQuestion} timeRemaining={timeRemaining} onAnswer={submitAnswer} />;
  }

  if (phase === 'results') {
    const wasCorrect       = myAnswer === correctOptionIndex;
    const correctOptionText =
      correctOptionIndex !== null && currentQuestion
        ? currentQuestion.options[correctOptionIndex]
        : null;

    return (
      <ResultView
        wasCorrect={wasCorrect}
        correctOptionText={correctOptionText}
        myScore={myScore}
      />
    );
  }

  if (phase === 'leaderboard') {
    return <LeaderboardView leaderboard={leaderboard} myPlayerId={myPlayerId} />;
  }

  if (phase === 'game_over') {
    return (
      <GameOverView
        finalLeaderboard={finalLeaderboard}
        myPlayerId={myPlayerId}
        myNickname={myNickname}
        myScore={myScore}
      />
    );
  }

  // Connecting fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 animate-pulse-slow">Connecting…</p>
    </div>
  );
};

export default PlayerGamePage;
