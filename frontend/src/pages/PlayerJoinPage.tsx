import { usePlayerJoin } from './usePlayerJoin';

const PlayerJoinPage = () => {
  const {
    pin,
    setPin,
    nickname,
    setNickname,
    error,
    loading,
    handleJoin,
    navigate
  } = usePlayerJoin();

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-5xl grid-cols-1 items-center gap-10 px-5 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-10">
        <section className="animate-fade-in">
          <div className="max-w-md">
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-lg bg-slate-950 font-[Outfit] text-lg font-black text-white shadow-sm">
              QA
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
              Player entry
            </p>
            <h1 className="font-[Outfit] text-5xl font-bold leading-tight tracking-normal text-slate-950">
              Join the room your host started.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Ask your host for the six digit room PIN, choose a name your class can recognize, and jump in.
            </p>
          </div>
        </section>

        <section className="w-full animate-fade-in">
          <div className="ml-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
            <div className="mb-7">
              <p className="text-sm font-semibold text-brand-700">QuizArena</p>
              <h2 className="mt-2 font-[Outfit] text-2xl font-bold tracking-normal text-slate-950">
                Join a game
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the room PIN exactly as it appears on the host screen.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Game PIN</label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-[Outfit] text-2xl font-bold tracking-[0.22em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  placeholder="Your name"
                  maxLength={20}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 6 || !nickname.trim()}
                className="w-full cursor-pointer rounded-lg bg-slate-950 py-3.5 font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join game'}
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              Host a game instead
            </button>
          </div>
          <p className="ml-auto mt-5 max-w-md text-center text-xs leading-5 text-slate-500">
            Your nickname is used only for this game session.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PlayerJoinPage;
