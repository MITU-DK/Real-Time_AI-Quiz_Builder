// Player: LockedView 
// Shown after the player has tapped an answer. Displays their locked choice
// and tells them to wait for other players.

import { OPTION_STYLES } from '../../constants/optionStyles';
import type { QuestionStartPayload } from '../../types';

interface LockedViewProps {
  myAnswer: number;
  question: QuestionStartPayload;
}

const LockedView = ({ myAnswer, question }: LockedViewProps) => {
  const style = OPTION_STYLES[myAnswer];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-[Outfit]">Answer Locked!</h2>
        <p className="text-slate-400 mt-2">Waiting for other players…</p>

        <div className="mt-6 px-6 py-4 bg-white rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Your answer</p>
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-md ${style.bg}`}>
            <span className="text-xl opacity-80">{style.label}</span>
            <span className="font-medium text-left leading-tight">{question.options[myAnswer]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockedView;
