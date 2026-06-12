// ─── Player: LeaderboardView ──────────────────────────────────────────────────
// Shown between questions. Displays the player's current rank and the top 5.

import type { LeaderboardEntry } from '../../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  myPlayerId: number | null;
}

const LeaderboardView = ({ leaderboard, myPlayerId }: LeaderboardViewProps) => {
  const myRank = leaderboard.findIndex((e) => e.playerId === myPlayerId) + 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="animate-fade-in text-center w-full max-w-sm">
        <h2 className="text-2xl font-bold text-slate-800 font-[Outfit] mb-2">🏆 Leaderboard</h2>

        {myRank > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
            <p className="text-sm text-blue-600">Your position</p>
            <p className="text-4xl font-bold text-blue-700 font-[Outfit]">#{myRank}</p>
            <p className="text-sm text-slate-500 mt-1">out of {leaderboard.length} players</p>
          </div>
        )}

        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((entry, i) => (
            <div
              key={entry.playerId}
              className={`flex items-center gap-3 p-3 rounded-xl animate-slide-up ${
                entry.playerId === myPlayerId
                  ? 'bg-blue-100 border border-blue-200'
                  : 'bg-white border border-slate-100'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="font-bold text-sm w-6">{i + 1}</span>
              <span className="flex-1 font-medium text-sm text-slate-700">{entry.nickname}</span>
              <span className="font-bold text-sm text-slate-600">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
