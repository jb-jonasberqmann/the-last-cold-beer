import Link from "next/link";
import { type ReactNode } from "react";

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-sm border-b border-stone-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="text-stone-400 hover:text-white transition-colors text-sm"
            >
              ← {backLabel}
            </Link>
          )}
          {title && (
            <h1 className="font-bold text-white font-game flex-1 truncate text-center">
              {title}
            </h1>
          )}
          {!title && (
            <Link href="/" className="font-bold text-amber-400 font-game">
              🍺 Last Cold Beer
            </Link>
          )}
          {gameId && teamId && (
            <div className="flex gap-2 ml-auto">
              <Link
                href={`/game/${gameId}/dashboard`}
                className="text-xs text-stone-400 hover:text-white transition-colors"
              >
                📊
              </Link>
              <Link
                href={`/game/${gameId}/case-file?team=${teamId}`}
                className="text-xs text-stone-400 hover:text-white transition-colors"
              >
                📁
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
