// ─── Player: WaitingView ──────────────────────────────────────────────────────
// Shown in the lobby while the host has not started the game yet.

interface WaitingViewProps {
  nickname: string;
}

const WaitingView = ({ nickname }: WaitingViewProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
    <div className="animate-fade-in text-center">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl animate-pulse-slow">⏳</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 font-[Outfit]">You're in!</h2>
      <p className="text-slate-500 mt-2">Waiting for the host to start the game…</p>
      <p className="text-sm text-blue-600 font-semibold mt-4">{nickname}</p>
    </div>
  </div>
);

export default WaitingView;
