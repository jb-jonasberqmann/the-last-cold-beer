"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface GameLayoutProps {
  children: ReactNode;
  gameId?: string;
  teamId?: string;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export function GameLayout({
  children,
  gameId,
  teamId,
  title,
  backHref,
  backLabel = "Back",
}: GameLayoutProps) {
  const { lang, toggle } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-sm border-b border-amber-900/30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="text-amber-700 hover:text-amber-400 transition-colors text-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ← {backLabel}
            </Link>
          )}
          {title && (
            <h1
              className="font-bold text-amber-200 flex-1 truncate text-center"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}
            >
              {title}
            </h1>
          )}
          {!title && (
            <Link href="/" className="font-bold text-amber-400" style={{ fontFamily: "Georgia, serif" }}>
              🍺 Last Cold Beer
            </Link>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Language toggle */}
            <button
              onClick={toggle}
              className="text-xs text-amber-700 hover:text-amber-400 border border-amber-900/50 hover:border-amber-700/60 rounded px-2 py-1 transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
              title={lang === "en" ? "Switch to Danish" : "Skift til engelsk"}
            >
              {lang === "en" ? "DA" : "EN"}
            </button>

            {gameId && teamId && (
              <>
                <Link
                  href={`/game/${gameId}/dashboard`}
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  📊
                </Link>
                <Link
                  href={`/game/${gameId}/case-file?team=${teamId}`}
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  📁
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
