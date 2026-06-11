"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError("Enter the room code (shown on the host's screen).");
      return;
    }
    router.push(`/join/${trimmed}`);
  };

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
            <span className="bg-stone-950 px-3 text-xs text-stone-500">or join with a code</span>
          </div>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setError("");
              setCode(e.target.value.toUpperCase().slice(0, 6));
            }}
            placeholder="Room code  e.g. AB12CD"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="bg-stone-800 border border-stone-600 rounded-xl px-4 py-4 text-white text-center text-xl font-mono uppercase placeholder:text-stone-600 placeholder:text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 tracking-widest"
          />
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
          <button
            type="submit"
            className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-4 rounded-xl transition-colors border border-stone-500 text-lg"
          >
            🚪 Join Game
          </button>
        </form>
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
