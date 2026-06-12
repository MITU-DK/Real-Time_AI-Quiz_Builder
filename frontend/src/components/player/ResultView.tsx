// Player: ResultView 
// Shown after a question ends. Tells the player if they were correct or wrong
// and shows their running score.

interface ResultViewProps {
  wasCorrect: boolean;
  correctOptionText: string | null;
  myScore: number;
}

const ResultView = ({ wasCorrect, correctOptionText, myScore }: ResultViewProps) => (
  <div
    className={`min-h-screen flex flex-col items-center justify-center p-6 ${wasCorrect
        ? 'bg-gradient-to-br from-green-50 to-emerald-50'
        : 'bg-gradient-to-br from-red-50 to-orange-50'
      }`}
  >
    <div className="animate-fade-in text-center">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${wasCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}
      >
        <span className="text-5xl">{wasCorrect ? '🎉' : '😕'}</span>
      </div>

      <h2 className={`text-2xl font-bold font-[Outfit] ${wasCorrect ? 'text-green-700' : 'text-red-700'}`}>
        {wasCorrect ? 'Correct!' : 'Wrong!'}
      </h2>

      {!wasCorrect && correctOptionText && (
        <p className="text-slate-600 mt-3 text-lg leading-tight px-4">
          The correct answer was:<br />
          <span className="font-bold text-slate-800">{correctOptionText}</span>
        </p>
      )}

      <div className="mt-6 bg-white/80 rounded-xl p-4 border border-slate-100">
        <p className="text-sm text-slate-400">Your score</p>
        <p className="text-3xl font-bold text-slate-800 font-[Outfit] animate-score">{myScore}</p>
      </div>
    </div>
  </div>
);

export default ResultView;
