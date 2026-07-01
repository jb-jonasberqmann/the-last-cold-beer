"use client";

import { useEffect } from "react";

export default function HostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HostPage error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center px-6 py-12 gap-6">
      <h1 className="text-xl font-bold text-red-400" style={{ fontFamily: "Georgia,serif" }}>
        Host page crashed
      </h1>
      <div className="w-full max-w-lg rounded-xl bg-stone-900 border border-red-900/60 p-4 text-sm font-mono space-y-2 break-all">
        <div className="text-red-300 font-bold">{error.name}: {error.message}</div>
        {error.digest && (
          <div className="text-stone-400">Digest: {error.digest}</div>
        )}
        {error.stack && (
          <pre className="text-stone-400 text-xs whitespace-pre-wrap mt-2">{error.stack}</pre>
        )}
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded text-white text-sm"
      >
        Try again
      </button>
    </div>
  );
}
