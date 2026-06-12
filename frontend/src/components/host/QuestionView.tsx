// ─── Host: QuestionView ───────────────────────────────────────────────────────
// The big-screen projector display during an active question.
// Shows question text, all 4 answer options (colored), and the synced timer.

import TimerBar from '../shared/TimerBar';
import { OPTION_STYLES } from '../../constants/optionStyles';
import type { QuestionStartPayload } from '../../types';

interface QuestionViewProps {
  question: QuestionStartPayload;
  timeRemaining: number;
}

const QuestionView = ({ question, timeRemaining }: QuestionViewProps) => {
  const seconds = Math.ceil(timeRemaining);
  const progress = (timeRemaining / question.timeLimitSeconds) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TimerBar seconds={seconds} progress={progress} />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Big timer number */}
        <div className={`text-6xl font-bold font-[Outfit] mb-4 ${seconds <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
          {seconds}
        </div>

        {/* Question card */}
        <div className="bg-slate-50 rounded-2xl p-8 max-w-3xl w-full text-center mb-8 border border-slate-100">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">
            Question {question.questionIndex + 1}
          </p>
          <h2 className="text-2xl font-bold text-slate-800 font-[Outfit]">
            {question.questionText}
          </h2>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4 max-w-3xl w-full">
          {question.options.map((option, i) => (
            <div
              key={i}
              className={`${OPTION_STYLES[i].bg} rounded-2xl p-6 text-white flex items-center gap-3`}
            >
              <span className="text-2xl">{OPTION_STYLES[i].shape}</span>
              <span className="text-lg font-medium">{option}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-400 mt-6">
          {question.points} points • {question.timeLimitSeconds}s
        </p>
      </div>
    </div>
  );
};

export default QuestionView;
