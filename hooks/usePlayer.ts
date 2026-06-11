"use client";

import { useEffect, useState } from "react";
import type { PlayerSession } from "@/types/game";

const STORAGE_KEY = "tlcb_player_session";

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
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSessionState(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const setSession = (s: PlayerSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSessionState(s);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  };

  return { session, setSession, clearSession, isLoaded };
}

// Read session without React state (for server-side safe reads)
export function getStoredSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: PlayerSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
