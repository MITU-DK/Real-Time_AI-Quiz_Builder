//HostGamePage
// Orchestrates the host side of a live quiz game.
// Connects to the socket, joins as host, then delegates rendering to
// focused sub-components based on the current game phase.

import { useHostGame } from './useHostGame';

//Sub-views
import LobbyView from '../components/host/LobbyView';
import QuestionView from '../components/host/QuestionView';
import ResultsView from '../components/host/ResultsView';
import LeaderboardView from '../components/host/LeaderboardView';
import GameOverView from '../components/host/GameOverView';

const HostGamePage = () => {
  const {
    pin,
    phase,
    players,
    totalPlayers,
    currentQuestion,
    correctOptionIndex,
    leaderboard,
    finalLeaderboard,
    countdown,
    timeRemaining,
    handleStartGame
  } = useHostGame();

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
