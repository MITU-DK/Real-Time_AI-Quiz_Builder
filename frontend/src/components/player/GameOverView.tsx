// ─── Player: GameOverView ─────────────────────────────────────────────────────
// Final screen for the player. Shows their medal, final rank, and score.

import { useNavigate } from 'react-router-dom';
import type { LeaderboardEntry } from '../../types';

interface GameOverViewProps {
  finalLeaderboard: LeaderboardEntry[];
  myPlayerId: number | null;
  myNickname: string;
  myScore: number;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const GameOverView = ({ finalLeaderboard, myPlayerId, myNickname, myScore }: GameOverViewProps) => {
  const navigate = useNavigate();
  const myRank = finalLeaderboard.findIndex((e) => e.playerId === myPlayerId) + 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="animate-fade-in text-center">
        <span className="text-6xl mb-4 block">{MEDALS[myRank] || '🎮'}</span>
        <h2 className="text-3xl font-bold text-slate-800 font-[Outfit]">Game Over!</h2>

        <div className="mt-6 bg-white/80 rounded-2xl p-6 border border-slate-100 shadow-lg">
          <p className="text-sm text-slate-400">{myNickname}</p>
          <p className="text-5xl font-bold text-slate-800 font-[Outfit] my-2">#{myRank}</p>
          <p className="text-2xl font-bold text-blue-600 font-[Outfit]">{myScore} pts</p>
        </div>

        <p className="text-sm text-slate-400 mt-6">Thanks for playing! 🎉</p>

        <button
          onClick={() => navigate('/play')}
          className="mt-8 px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default GameOverView;
