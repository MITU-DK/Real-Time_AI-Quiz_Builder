import { useDashboard } from './useDashboard';

const DashboardPage = () => {
  const {
    quizzes,
    loading,
    generating,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    numQuestions,
    setNumQuestions,
    showGenerator,
    setShowGenerator,
    error,
    setError,
    user,
    handleGenerate,
    handleHost,
    handleDelete,
    handleViewQuiz,
    handleLogout,
    resultsPin,
    setResultsPin,
    handleViewResults
  } = useDashboard();

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-500 font-[Outfit]">⚡ QuizArena</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Hi, {user?.display_name}</span>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-500 transition cursor-pointer">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6 border border-red-100 animate-fade-in">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600 cursor-pointer">✕</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-[Outfit]">My Quizzes</h2>
            <p className="text-sm text-slate-400 mt-1">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created</p>
          </div>

          <div className="flex flex-col md:flex-row gap-9 w-full md:w-auto">
            {/* View Past Results Form */}
            <form onSubmit={handleViewResults} className="flex items-center">
              <input
                type="text"
                placeholder="Game PIN..."
                value={resultsPin}
                onChange={(e) => setResultsPin(e.target.value)}
                className="w-32 px-3 py-2.5 rounded-l-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none uppercase transition font-mono text-sm"
              />
              <button
                type="submit"
                disabled={!resultsPin.trim()}
                className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-semibold rounded-r-xl border border-l-0 border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Results
              </button>
            </form>

            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300 cursor-pointer whitespace-nowrap"
            >
              {showGenerator ? '✕ Close' : '✨ Generate Quiz with AI'}
            </button>
          </div>
        </div>

        {/* AI Generator Panel */}
        {showGenerator && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-blue-50 p-6 mb-8 animate-slide-up">
            <h3 className="text-lg font-semibold text-slate-700 font-[Outfit] mb-4">🤖 AI Quiz Generator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. JavaScript Basics"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-400 transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Questions</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-400 transition"
                >
                  {[2, 5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating ? '🔄 Generating…' : '🚀 Generate & Save'}
            </button>
          </div>
        )}

        {/* Quiz List */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse-slow">Loading your quizzes…</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-slate-500">No quizzes yet. Generate one with AI!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz, i) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 font-[Outfit]">{quiz.title}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{quiz.topic}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Created {new Date(quiz.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleHost(quiz.id)}
                    className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    🎮 Host Game
                  </button>
                  <button
                    onClick={() => handleViewQuiz(quiz.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-500 text-sm rounded-xl transition cursor-pointer"
                    title="View questions"
                  >
                    👁
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 text-sm rounded-xl transition cursor-pointer"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
