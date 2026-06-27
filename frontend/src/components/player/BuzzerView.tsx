// Player: BuzzerView 
// Active question pad — shows the question text, synced timer, and 4 large
// colored buttons for the player to tap their answer.
// Layout mirrors the host's QuestionView for a consistent experience.

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
  const isUrgent = seconds <= 5;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Timer bar at very top */}
      <TimerBar seconds={seconds} progress={progress} />

      {/* Countdown number — same style as host */}
      <div className="text-center py-2 shrink-0">
        <span className={`text-3xl font-bold font-[Outfit] ${isUrgent ? 'text-red-500' : 'text-slate-700'}`}>
          {seconds}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">

        {/* Question card — mirrors host */}
        <div className="bg-slate-50 rounded-2xl p-8 max-w-3xl w-full text-center mb-8 border border-slate-100">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">
            Question {question.questionIndex + 1}
          </p>
          <h2 className="text-2xl font-bold text-slate-800 font-[Outfit]">
            {question.questionText}
          </h2>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-4 max-w-3xl w-full">
          {OPTION_STYLES.map((style, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              className={`${style.bg} ${style.activeBg} rounded-2xl flex items-center gap-3 text-white shadow-lg active:scale-95 transition-all p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl`}
            >
              <span className="text-2xl">{style.shape}</span>
              <span className="text-lg font-medium text-left">{question.options[i]}</span>
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400 mt-6">
          Up to {question.points} pts • {question.timeLimitSeconds}s
        </p>
      </div>
    </div>
  );
};

export default BuzzerView;
