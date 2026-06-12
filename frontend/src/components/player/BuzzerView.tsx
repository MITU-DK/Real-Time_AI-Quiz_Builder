// ─── Player: BuzzerView ───────────────────────────────────────────────────────
// Active question pad — shows the question text, synced timer, and 4 large
// colored buttons for the player to tap their answer.

import TimerBar from '../shared/TimerBar';
import { OPTION_STYLES } from '../../constants/optionStyles';
import type { QuestionStartPayload } from '../../types';

interface BuzzerViewProps {
  question: QuestionStartPayload;
  timeRemaining: number;
  onAnswer: (index: number) => void;
}

const BuzzerView = ({ question, timeRemaining, onAnswer }: BuzzerViewProps) => {
  const seconds = Math.ceil(timeRemaining);
  const progress = (timeRemaining / question.timeLimitSeconds) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TimerBar seconds={seconds} progress={progress} />

      {/* Question text */}
      <div className="px-6 pb-4 text-center shrink-0">
        <h2 className="text-xl font-bold text-slate-800 font-[Outfit] leading-tight">
          {question.questionText}
        </h2>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-4xl mx-auto w-full pb-8">
        {OPTION_STYLES.map((style, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i)}
            className={`${style.bg} ${style.activeBg} rounded-2xl flex items-center justify-start text-white shadow-lg active:scale-95 transition-transform p-6 cursor-pointer min-h-[100px]`}
          >
            {/* Shape + label badge */}
            <div className="flex flex-col items-center justify-center w-12 shrink-0 bg-white/20 rounded-lg py-2">
              <span className="text-2xl leading-none">{style.shape}</span>
              <span className="text-xs font-bold mt-1">{style.label}</span>
            </div>
            {/* Option text */}
            <span className="text-lg font-medium ml-4 text-left leading-tight">
              {question.options[i]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuzzerView;
