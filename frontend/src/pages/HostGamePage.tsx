//HostGamePage
// Orchestrates the host side of a live quiz game.
// Connects to the socket, joins as host, then delegates rendering to
// focused sub-components based on the current game phase.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useSyncTimer } from '../hooks/useSyncTimer';
import { useGameSocket } from '../hooks/useGameSocket';

//Sub-views
import LobbyView from '../components/host/LobbyView';
import QuestionView from '../components/host/QuestionView';
import ResultsView from '../components/host/ResultsView';
import LeaderboardView from '../components/host/LeaderboardView';
import GameOverView from '../components/host/GameOverView';

const HostGamePage = () => {
  const { pin } = useParams<{ pin: string }>();

  //Store selectors
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const totalPlayers = useGameStore((s) => s.totalPlayers);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const correctOptionIndex = useGameStore((s) => s.correctOptionIndex);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const finalLeaderboard = useGameStore((s) => s.finalLeaderboard);
  const setPin = useGameStore((s) => s.setPin);
  const setIsHost = useGameStore((s) => s.setIsHost);

  // Registers all socket listeners, removes them on unmount
  useGameSocket();

  const user = useAuthStore((s) => s.user);
  const timeRemaining = useSyncTimer();

  const [countdown, setCountdown] = useState<number | null>(null);

  //Connect and join as host on mount
  useEffect(() => {
    if (!pin || !user) return;

    setPin(pin);
    setIsHost(true);

    const socket = connectSocket();

    socket.emit('join_as_host', { pin, hostId: user.id });
    socket.emit('sync_time', { t0: Date.now() });

    return () => {
      disconnectSocket();
    };
  }, [pin, user]);

  //Kick off the game with a 3-second visual countdown
  const handleStartGame = () => {
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

  //Pre-game countdown overlay
  if (countdown !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="text-center animate-countdown" key={countdown}>
          <p className="text-9xl font-bold text-white font-[Outfit] drop-shadow-xl">{countdown}</p>
          <p className="text-xl text-white/70 mt-4">Get ready!</p>
        </div>
      </div>
    );
  }

  //Phase-based rendering
  if (phase === 'idle' || phase === 'lobby') {
    return (
      <LobbyView
        pin={pin ?? ''}
        players={players}
        totalPlayers={totalPlayers}
        onStart={handleStartGame}
      />
    );
  }

  if (phase === 'question' && currentQuestion) {
    return <QuestionView question={currentQuestion} timeRemaining={timeRemaining} />;
  }

  if (phase === 'results' && currentQuestion) {
    return <ResultsView question={currentQuestion} correctOptionIndex={correctOptionIndex} />;
  }

  if (phase === 'leaderboard') {
    return <LeaderboardView leaderboard={leaderboard} />;
  }

  if (phase === 'game_over') {
    return <GameOverView finalLeaderboard={finalLeaderboard} />;
  }

  // Connecting fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 animate-pulse-slow">Connecting…</p>
    </div>
  );
};

export default HostGamePage;
