// ─── Host: QuestionView ───────────────────────────────────────────────────────
// The big-screen projector display during an active question.
// Shows question text, all 4 answer options (colored), and the synced timer.

import TimerBar from '../shared/TimerBar';
import { OPTION_STYLES } from '../../constants/optionStyles';
import type { QuestionStartPayload } from '../../types';

interface QuestionViewProps {
  question: QuestionStartPayload;
  timeRemaining: number;
  answerCount: number;
  totalPlayers: number;
}

const QuestionView = ({ question, timeRemaining, answerCount, totalPlayers }: QuestionViewProps) => {
  const seconds = Math.ceil(timeRemaining);
  const progress = (timeRemaining / question.timeLimitSeconds) * 100;
  const isUrgent = seconds <= 5;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TimerBar seconds={seconds} progress={progress} />

      {/* Countdown number */}
      <div className="text-center py-2 shrink-0">
        <span className={`text-3xl font-bold font-[Outfit] ${isUrgent ? 'text-red-500' : 'text-slate-700'}`}>
          {seconds}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">

        {/* Question card */}
        <div className="bg-slate-50 rounded-2xl p-8 max-w-3xl w-full text-center mb-8 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-semibold">
            Question {question.questionIndex + 1}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 font-[Outfit] leading-tight">
            {question.questionText}
          </h2>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4 max-w-3xl w-full">
          {question.options.map((option, i) => (
            <div
              key={i}
              className={`${OPTION_STYLES[i].bg} rounded-2xl p-6 text-white flex items-center gap-4 shadow-md`}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 shrink-0 bg-white/20 rounded-xl">
                 <span className="text-xl shadow-sm">{OPTION_STYLES[i].shape}</span>
              </div>
              <span className="text-xl font-semibold leading-tight drop-shadow-sm">{option}</span>
            </div>
          ))}
        </div>

        {/* Footer info: points, time, and LIVE answer count */}
        <div className="mt-8 flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium">
            🏆 {question.points} points
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <p className="text-slate-500 font-medium">
            ⏱️ {question.timeLimitSeconds}s
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            📝 Answers: 
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-lg">
              {answerCount} / {totalPlayers}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
