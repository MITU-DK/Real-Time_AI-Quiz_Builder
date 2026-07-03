// ─── Host: GameOverView ───────────────────────────────────────────────────────
// Final screen — animated confetti, top-3 podium, full leaderboard, and
// a button to go back to the dashboard to host another game.

import { useNavigate } from 'react-router-dom';
import LeaderboardRow from '../shared/LeaderboardRow';
import type { LeaderboardEntry } from '../../types';

interface GameOverViewProps {
  finalLeaderboard: LeaderboardEntry[];
}

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_ORDER = [1, 0, 2]; // silver on left, gold in middle, bronze on right
const PODIUM_HEIGHTS = ['h-44', 'h-36', 'h-28'];
const CONFETTI_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6'];

const GameOverView = ({ finalLeaderboard }: GameOverViewProps) => {
  const navigate = useNavigate();
  const top3 = finalLeaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Confetti particles ---that falls from top screen to bottom at end . */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full pointer-events-none"
          style={{
            left: `${(i / 20) * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % 5],
            animation: `confetti-fall ${2 + (i % 3)}s linear ${(i % 4) * 0.5}s infinite`,
          }}
        />
      ))}

      <h2 className="text-4xl font-bold text-slate-800 font-[Outfit] mb-2 animate-fade-in z-10">
        🎉 Game Over!
      </h2>
      <p className="text-slate-500 mb-10 animate-fade-in z-10">Final standings</p>

      {/* Podium */}
      <div className="flex items-end gap-4 mb-10 z-10">
        {PODIUM_ORDER.map((podiumIdx, colIdx) => {
          const entry = top3[podiumIdx];
          if (!entry) return null;
          return (
            <div
              key={podiumIdx}
              className="flex flex-col items-center animate-slide-up"
              style={{ animationDelay: `${colIdx * 200}ms` }}
            >
              <span className="text-4xl mb-2">  {MEDALS[podiumIdx]}   </span>
              <p className="font-bold text-slate-800 font-[Outfit] text-lg">    {entry.nickname}   </p>
              <p className="text-sm text-slate-500 mb-2">{entry.score} pts</p>
              <div className={`w-24 ${PODIUM_HEIGHTS[podiumIdx]} bg-blue-${podiumIdx === 0 ? '600' : podiumIdx === 1 ? '500' : '400'} rounded-t-xl`} />
            </div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      {finalLeaderboard.length > 3 && (
        <div className="w-full max-w-lg space-y-2 z-10 mb-8">
          {finalLeaderboard.slice(3).map((entry, i) => (
            <LeaderboardRow key={entry.playerId} entry={entry} rank={i + 4} delay={i * 80} />
          ))}
        </div>
      )}

      {/* Back to dashboard */}
      <div className="mt-4 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default GameOverView;
