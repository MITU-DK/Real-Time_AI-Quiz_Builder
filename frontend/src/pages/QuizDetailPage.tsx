import { useQuizDetail } from './useQuizDetail';

// Kahoot-style option colors: Red / Blue / Amber / Green
const OPTION_COLORS = [
  { bg: 'bg-green-500', text: 'text-white', label: 'A' },
  { bg: 'bg-green-500', text: 'text-white', label: 'B' },
  { bg: 'bg-green-500', text: 'text-white', label: 'C' },
  { bg: 'bg-green-500', text: 'text-white', label: 'D' },
];

const difficultyColor = (d: string) => {
  switch (d) {
    case 'easy': return 'bg-green-100 text-green-700';
    case 'medium': return 'bg-amber-100 text-amber-700';
    case 'hard': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const QuizDetailPage = () => {
  const { quiz, loading, error, goBack } = useQuizDetail();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={goBack}
            className="text-slate-400 hover:text-slate-700 transition text-xl cursor-pointer"
            aria-label="Back to dashboard"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-slate-800 font-[Outfit]">
            {loading ? 'Loading…' : (quiz?.title ?? 'Quiz Detail')}
          </h1>
          {quiz && (
            <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm" />
            ))}
          </div>
        )}

        {/* Quiz meta */}
        {quiz && !loading && (
          <>
            <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
              <span>📚 {quiz.topic}</span>
              <span>·</span>
              <span>{quiz.questions?.length ?? 0} question{quiz.questions?.length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>Created {new Date(quiz.created_at).toLocaleDateString()}</span>
            </div>

            {/* Question list */}
            <div className="space-y-6">
              {(quiz.questions ?? []).map((q, qi) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 animate-fade-in"
                  style={{ animationDelay: `${qi * 60}ms` }}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-5">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                      {qi + 1}
                    </span>
                    <p className="text-slate-800 font-semibold text-lg leading-snug font-[Outfit]">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Options grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {q.options.map((opt, oi) => {
                      const style = OPTION_COLORS[oi];
                      const isCorrect = oi === q.correct_option_index;
                      return (
                        <div
                          key={oi}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
                            ${isCorrect
                              ? `${style.bg} ${style.text} shadow-md ring-2 ring-offset-2 ring-white`
                              : 'bg-slate-50 text-slate-500 border border-slate-100'
                            }
                          `}
                        >
                          <span className={`text-lg ${isCorrect ? 'text-white' : 'text-slate-300'}`}>
                            {style.label}
                          </span>
                          <span className={`font-bold mr-1 ${isCorrect ? 'text-white/80' : 'text-slate-300'}`}>
                            {style.label}
                          </span>
                          {opt}
                          {isCorrect && (
                            <span className="ml-auto text-white/90 text-xs font-bold">✓ Correct</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Question meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
                    <span>⏱ {q.time_limit_seconds}s</span>
                    <span>⭐ {q.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default QuizDetailPage;
