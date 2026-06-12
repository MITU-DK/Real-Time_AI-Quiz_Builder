import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '../services/socket';
import { useGameStore } from '../store/useGameStore';

const PlayerJoinPage = () => {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setStorePin = useGameStore((s) => s.setPin);
  const setMyPlayer = useGameStore((s) => s.setMyPlayer);
  const setPhase = useGameStore((s) => s.setPhase);

  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;
    setError('');
    setLoading(true);

    const socket = connectSocket();

    // Clean up any existing listeners from previous failed attempts
    socket.off('player_joined');
    socket.off('error');

    // Listen for success (player_joined) to know our playerId
    socket.on('player_joined', (data) => {
      // Check if this is us (latest joiner matches our nickname)
      if (data.nickname === nickname.trim()) {
        setStorePin(pin.trim());
        setMyPlayer(data.playerId, nickname.trim());
        setPhase('lobby');

        // Persist for reconnection
        localStorage.setItem('player_pin', pin.trim());
        localStorage.setItem('player_nickname', nickname.trim());
        localStorage.setItem('player_id', data.playerId.toString());

        // NTP sync
        socket.emit('sync_time', { t0: Date.now() });

        navigate(`/play/${pin.trim()}`);
      }
    });

    // Listen for errors
    socket.on('error', (msg: string) => {
      setError(msg);
      setLoading(false);
    });

    // Emit join
    socket.emit('join_room', { pin: pin.trim(), nickname: nickname.trim() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-700 font-[Outfit]">🎮</h1>
          <h2 className="text-2xl font-bold text-slate-800 font-[Outfit] mt-2">Join a Game</h2>
          <p className="text-sm text-slate-400 mt-1">Enter the PIN shown on the host's screen</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-8 border border-slate-100">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Game PIN</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-800 tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                placeholder="• • • • • •"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                placeholder="Enter your name"
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || pin.length < 6 || !nickname.trim()}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Joining…' : '🚀 Join Game'}
            </button>
          </form>
        </div>

        {/* Host link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            ← Host a game instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerJoinPage;
