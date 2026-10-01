import { useLogin } from './useLogin';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const LoginPage = () => {
  const {
    isRegister,
    setIsRegister,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    error,
    setError,
    loading,
    handleSubmit,
    navigate
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

   return (
    <div className="min-h-screen bg-zinc-100 font-body text-zinc-900 selection:bg-brand/10 selection:text-brand">
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-[12px] bg-brand ring-4 ring-brand/10">
              <div className="size-5 rotate-45 rounded-sm bg-zinc-50" />
            </div>
            <span className="font-display text-3xl font-semibold tracking-tight text-zinc-950">
              QuizArena
            </span>
          </div>
          <p className="text-balance text-sm font-medium uppercase tracking-wide text-zinc-500">
            Real-Time AI-Powered Quiz Builder
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-[440px]">
          <div className="relative rounded-[32px] bg-zinc-50 p-8 ring-1 ring-black/5 md:p-10">
            <div className="mb-8">
              <h1 className="mb-2 text-balance font-display text-2xl font-semibold leading-tight text-zinc-950">
                {isRegister ? "Create your teacher account" : "Ready for the next round?"}
              </h1>
              <p className="text-pretty text-base text-zinc-600">
                {isRegister
                  ? "Set up your dashboard in under a minute."
                  : "Sign in to your teacher dashboard to start building."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {isRegister && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="displayName"
                    className="ml-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Mrs. Douglas"
                    className="w-full rounded-xl border-none bg-zinc-100 px-4 py-3 text-base ring-1 ring-zinc-200 transition-shadow placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="ml-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Teacher Email
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="mrs.douglas@academy.edu"
                  className="w-full rounded-xl border-none bg-zinc-100 px-4 py-3 text-base ring-1 ring-zinc-200 transition-shadow placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="ml-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-none bg-zinc-100 py-3 pl-4 pr-12 text-base ring-1 ring-zinc-200 transition-shadow placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    aria-controls="password"
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white ring-2 ring-brand-600/20 ring-offset-2 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>
                  {loading
                    ? isRegister
                      ? "Creating account…"
                      : "Signing in…"
                    : isRegister
                      ? "Create Account"
                      : "Launch Dashboard"}
                </span>
                {!loading && (
                  <div className="ml-2 transition-transform group-hover:translate-x-0.5">
                    <svg
                      className="size-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4 border-t border-zinc-950/5 pt-6">
              <p className="text-sm text-zinc-600">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                  }}
                  className="font-semibold text-zinc-950 transition-colors hover:text-brand-600"
                >
                  {isRegister ? "Sign in" : "Register"}
                </button>
              </p>
            </div>
          </div>

          {/* Secondary Action */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate("/play")}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-200/50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-950"
            >
              <span className="mr-1 flex items-center rounded-full bg-zinc-50 py-1.5 pl-2 pr-3 ring-1 ring-black/5">
                <svg
                  className="mr-2 size-3 text-zinc-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Live Mode
                </span>
              </span>
              Join a game as a player
              <svg
                className="size-4 shrink-0 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scoreboard flourishes */}
        <div className="fixed bottom-8 left-8 hidden lg:block">
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="h-px w-12 bg-zinc-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Round 01
            </span>
          </div>
        </div>
        <div className="fixed bottom-8 right-8 hidden lg:block">
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Awaiting Teacher
            </span>
            <div className="h-px w-12 bg-zinc-300" />
          </div>
        </div>
      </main>
    </div>
  );
}
export default LoginPage;
