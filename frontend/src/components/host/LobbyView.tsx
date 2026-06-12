// Host: LobbyView 
// Shown before the game starts. Displays the PIN, player list, and Start button.

import type { Player } from '../../types';

interface LobbyViewProps {
  pin: string;
  players: Player[];
  totalPlayers: number;
  onStart: () => void;
}

const LobbyView = ({ pin, players, totalPlayers, onStart }: LobbyViewProps) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
    {/* Header */}
    <div className="bg-white/80 backdrop-blur border-b border-slate-100 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700 font-[Outfit]">⚡ QuizBlitz</h1>
        <span className="text-sm text-slate-400">Host View</span>
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Giant PIN */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-10 text-center mb-8 border border-slate-100 animate-fade-in">
        <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">Game PIN</p>
        <p className="text-7xl font-extrabold text-blue-700 font-[Outfit] tracking-[0.2em]">{pin}</p>
        <p className="text-sm text-slate-400 mt-3">Share this PIN with your players</p>
      </div>

      {/* Player count */}
      <div className="text-center mb-6">
        <p className="text-4xl font-bold text-slate-700 font-[Outfit]">{totalPlayers}</p>
        <p className="text-sm text-slate-400">player{totalPlayers !== 1 ? 's' : ''} joined</p>
      </div>

      {/* Player chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-2xl mb-8">
        {players.map((p, i) => (
          <span
            key={p.playerId}
            className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-sm font-medium text-slate-700 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {p.nickname}
          </span>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={totalPlayers === 0}
        className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        🚀 Start Game
      </button>
    </div>
  </div>
);

export default LobbyView;
