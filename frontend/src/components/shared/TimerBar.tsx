// TimerBar 
// Displays a shrinking progress bar and countdown number.
// Used in both the Host question view and the Player buzzer view.

interface TimerBarProps {
  seconds: number;
  progress: number; // 0–100
}

const TimerBar = ({ seconds, progress }: TimerBarProps) => {
  const isUrgent = seconds <= 5;

  return (
    <div className="h-2 bg-slate-100 shrink-0">
      <div
        className={`h-full transition-all duration-100 ease-linear ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TimerBar;
