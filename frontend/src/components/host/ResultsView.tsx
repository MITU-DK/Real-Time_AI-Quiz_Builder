// ─── Host: ResultsView ────────────────────────────────────────────────────────
// Shown after a question closes. Lists all 4 options with the correct one
// highlighted in green. Transitions to LeaderboardView after 3s (handled by store).

import { OPTION_STYLES } from '../../constants/optionStyles';
import type { QuestionStartPayload } from '../../types';

interface ResultsViewProps {
  question: QuestionStartPayload;
  correctOptionIndex: number | null;
}

const ResultsView = ({ question, correctOptionIndex }: ResultsViewProps) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
    <div className="max-w-3xl w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 font-[Outfit] text-center mb-2">
        {question.questionText}
      </h2>
      <p className="text-sm text-slate-400 text-center mb-8">
        Correct answer highlighted in green
      </p>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isCorrect = i === correctOptionIndex;
          return (
            <div
              key={i}
              className={`rounded-2xl p-5 flex items-center gap-3 transition-all animate-slide-up ${isCorrect
                  ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                  : 'bg-slate-100 text-slate-600'
                }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-xl font-bold">{OPTION_STYLES[i].label}</span>
              <span className="flex-1 font-medium">{option}</span>
              {isCorrect && <span className="text-2xl">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default ResultsView;
