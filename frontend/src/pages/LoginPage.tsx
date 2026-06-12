import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerUser(email, password, displayName);
      } else {
        data = await loginUser(email, password);
      }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-700 font-[Outfit] tracking-tight">
            ⚡ QuizBlitz
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Real-Time AI-Powered Quiz Builder
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 font-[Outfit]">
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                  placeholder="Mr. Teacher"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                placeholder="teacher@school.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-200 hover:shadow-brand-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-brand-600 hover:text-brand-700 hover:underline transition cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Player join link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/play')}
            className="text-sm text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            🎮 Join a game as a player →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
