"use client";

import { useEffect, useState } from "react";
import type { PlayerSession } from "@/types/game";

const STORAGE_KEY = "tlcb_player_session";

// sessionStorage gives each browser tab its own isolated session.
// This prevents tab-to-tab contamination when testing multiple players on the
// same device — the last tab to write no longer overwrites everyone else.
// Sessions survive in-tab refreshes and back/forward navigation just fine.

export function usePlayer(): {
  session: PlayerSession | null;
  setSession: (session: PlayerSession) => void;
  clearSession: () => void;
  isLoaded: boolean;
} {
  const [session, setSessionState] = useState<PlayerSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSessionState(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const setSession = (s: PlayerSession) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSessionState(s);
  };

  const clearSession = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  };

  return { session, setSession, clearSession, isLoaded };
}

// Read session without React state (for server-side safe reads)
export function getStoredSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: PlayerSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

