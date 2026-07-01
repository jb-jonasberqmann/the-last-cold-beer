"use client";

import { useEffect } from "react";

// Catches errors in the root layout — last resort error boundary
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0c0a09", color: "#fff", fontFamily: "Georgia,serif", padding: "2rem" }}>
        <h1 style={{ color: "#f87171", marginBottom: "1rem" }}>Application error</h1>
        <div style={{ fontFamily: "monospace", fontSize: "0.85rem", background: "#1c1917", padding: "1rem", borderRadius: "0.5rem", wordBreak: "break-all" }}>
          <div style={{ color: "#fca5a5", fontWeight: "bold" }}>{error.name}: {error.message}</div>
          {error.digest && <div style={{ color: "#78716c", marginTop: "0.5rem" }}>Digest: {error.digest}</div>}
          {error.stack && <pre style={{ color: "#a8a29e", fontSize: "0.75rem", whiteSpace: "pre-wrap", marginTop: "0.75rem" }}>{error.stack}</pre>}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", background: "#b45309", color: "#fff", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
