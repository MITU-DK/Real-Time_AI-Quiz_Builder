import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameResults } from '../services/api';
import type { GameResultEntry } from '../types';
import LeaderboardRow from '../components/shared/LeaderboardRow';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_ORDER = [1, 0, 2]; // silver on left, gold in middle, bronze on right
const PODIUM_HEIGHTS = ['h-36', 'h-44', 'h-28'];
const CONFETTI_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6'];

const PastResultsPage = () => {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<GameResultEntry[]>([]);

  useEffect(() => {
    if (!pin) return;

    const fetchResults = async () => {
      try {
        const data = await getGameResults(pin);
        setPlayers(data.players);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch game results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [pin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading results for {pin}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const top3 = players.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Confetti particles */}
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
        🏆 Results for PIN: {pin}
      </h2>
      <p className="text-slate-500 mb-10 animate-fade-in z-10">Historical Standings</p>

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
              <span className="text-4xl mb-2">{MEDALS[podiumIdx]}</span>
              <p className="font-bold text-slate-800 font-[Outfit] text-lg">{entry.nickname}</p>
              <p className="text-sm text-slate-500 mb-2">{entry.score} pts</p>
              <div className={`w-24 ${PODIUM_HEIGHTS[podiumIdx]} bg-blue-${podiumIdx === 1 ? '600' : podiumIdx === 0 ? '500' : '400'} rounded-t-xl shadow-lg`} />
            </div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      {players.length > 3 && (
        <div className="w-full max-w-lg space-y-2 z-10 mb-8">
          {players.slice(3).map((entry, i) => (
            <LeaderboardRow key={entry.playerId} entry={entry} rank={entry.finalRank || i + 4} delay={i * 80} />
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

export default PastResultsPage;
