// Host: LeaderboardView 
// Shown BETWEEN questions. Displays the current top-5 rankings.

import LeaderboardRow from '../shared/LeaderboardRow';
import type { LeaderboardEntry } from '../../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
}

const LeaderboardView = ({ leaderboard }: LeaderboardViewProps) => {
  const top5 = leaderboard.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold text-slate-800 font-[Outfit] mb-8 animate-fade-in">
        🏆 Leaderboard
      </h2>
      <div className="w-full max-w-lg space-y-3">
        {top5.map((entry, i) => (
          <LeaderboardRow key={entry.playerId} entry={entry} rank={i + 1} delay={i * 120} />
        ))}
      </div>
    </div>
  );
};

export default LeaderboardView;
