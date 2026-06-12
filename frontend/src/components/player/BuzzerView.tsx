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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TimerBar seconds={seconds} progress={progress} />

      {/* Main content area - centered vertically */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 pb-12 pt-4">
        
        {/* Question text */}
        <div className="mb-10 text-center max-w-4xl w-full animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 font-[Outfit] leading-tight drop-shadow-sm">
            {question.questionText}
          </h2>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
          {OPTION_STYLES.map((style, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              className={`${style.bg} ${style.activeBg} rounded-2xl flex items-center justify-start text-white shadow-lg active:scale-95 transition-all p-6 cursor-pointer min-h-[100px] hover:-translate-y-1 hover:shadow-xl`}
            >
              {/* Shape + label badge */}
              <div className="flex flex-col items-center justify-center w-14 h-14 shrink-0 bg-white/25 rounded-xl">
                <span className="text-2xl leading-none shadow-sm">{style.shape}</span>
                <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{style.label}</span>
              </div>
              {/* Option text */}
              <span className="text-xl md:text-2xl font-semibold ml-5 text-left leading-tight drop-shadow-sm">
                {question.options[i]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuzzerView;
