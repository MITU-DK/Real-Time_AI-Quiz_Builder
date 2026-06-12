// ─── TimerBar ─────────────────────────────────────────────────────────────────
// Displays a shrinking progress bar and countdown number.
// Used in both the Host question view and the Player buzzer view.

interface TimerBarProps {
  seconds: number;
  progress: number; // 0–100
}

const TimerBar = ({ seconds, progress }: TimerBarProps) => {
  const isUrgent = seconds <= 5;

  return (
    <>
      {/* Sliding bar */}
      <div className="h-2 bg-slate-100 shrink-0">
        <div
          className={`h-full transition-all duration-100 ease-linear ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Countdown number */}
      <div className="text-center py-2 shrink-0">
        <span className={`text-3xl font-bold font-[Outfit] ${isUrgent ? 'text-red-500' : 'text-slate-700'}`}>
          {seconds}
        </span>
      </div>
    </>
  );
};

export default TimerBar;
