// ─── LeaderboardRow ───────────────────────────────────────────────────────────
// A single row in a leaderboard list.
// Used by the Host's LeaderboardView and GameOverView.

import type { LeaderboardEntry } from '../../types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  delay?: number;
  highlighted?: boolean; // highlights the current player's row
}

const RANK_COLORS: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700 border-amber-200',
  2: 'bg-slate-100 text-slate-600 border-slate-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
};

const MEDALS = ['🥇', '🥈', '🥉'];

const LeaderboardRow = ({ entry, rank, delay = 0, highlighted = false }: LeaderboardRowProps) => {
  const baseClass = highlighted
    ? 'bg-blue-100 border-blue-200 text-blue-800'
    : RANK_COLORS[rank] ?? 'bg-white text-slate-700 border-slate-100';

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border animate-slide-up ${baseClass}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-xl font-bold font-[Outfit] w-8 text-center">
        {rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}
      </span>
      <span className="flex-1 font-medium">{entry.nickname}</span>
      <span className="font-bold font-[Outfit] animate-score">{entry.score}</span>
    </div>
  );
};

export default LeaderboardRow;
