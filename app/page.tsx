import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/20 to-stone-950 flex flex-col items-center justify-center p-6">
      {/* Title block */}
      <div className="text-center mb-12 max-w-sm">
        <div className="text-6xl mb-4 animate-flicker">🍺</div>
        <h1 className="text-4xl font-bold text-amber-400 font-game mb-2 tracking-wide">
          The Last Cold Beer
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed">
          Only the worthy may open it.
        </p>
        <div className="mt-4 text-xs text-stone-600 italic">
          A 2-team mystery quest. 3 chapters. 1 truth.
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/create"
          className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-center py-4 rounded-xl transition-colors border border-amber-400 text-lg"
        >
          🏕️ Host a Game
        </Link>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-stone-950 px-3 text-xs text-stone-500">or</span>
          </div>
        </div>
        <JoinForm />
      </div>

      {/* Footer flavor */}
      <div className="mt-16 text-center">
        <p className="text-xs text-stone-700 italic">
          One impossibly cold beer. Two teams. Zero explanations.
        </p>
      </div>
    </div>
  );
}

function JoinForm() {
  return (
    <form action="/join" method="GET" className="flex flex-col gap-3">
      <input
        type="text"
        name="code"
        placeholder="Enter room code"
        maxLength={6}
        className="bg-stone-800 border border-stone-600 rounded-xl px-4 py-4 text-white text-center text-xl font-mono uppercase placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 tracking-widest"
      />
      <button
        type="submit"
        className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-4 rounded-xl transition-colors border border-stone-500 text-lg"
      >
        🚪 Join Game
      </button>
    </form>
  );
}
