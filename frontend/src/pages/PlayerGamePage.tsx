// ─── PlayerGamePage ───────────────────────────────────────────────────────────
// Orchestrates the player side of a live quiz game.
// Reconnects to the socket, restores credentials from localStorage, then
// delegates rendering to focused sub-components based on the current game phase.

import { usePlayerGame } from './usePlayerGame';

// ─── Sub-views
import WaitingView     from '../components/player/WaitingView';
import BuzzerView      from '../components/player/BuzzerView';
import LockedView      from '../components/player/LockedView';
import ResultView      from '../components/player/ResultView';
import LeaderboardView from '../components/player/LeaderboardView';
import GameOverView    from '../components/player/GameOverView';

const PlayerGamePage = () => {
  const {
    phase,
    currentQuestion,
    myAnswer,
    isLocked,
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
  } = usePlayerGame();

  if (countdown !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="text-center animate-countdown" key={countdown}>
          <p className="text-9xl font-bold text-white font-[Outfit] drop-shadow-xl">{countdown}</p>
          <p className="text-xl text-white/70 mt-4">Get ready!</p>
        </div>
      </div>
    );
  }

  // Phase-based rendering

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
