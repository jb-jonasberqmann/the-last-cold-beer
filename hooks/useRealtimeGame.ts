"use client";

import { useEffect, useRef } from "react";

const POLL_INTERVAL = 5000; // 5 seconds — fast enough for a party game

type PollCallback = () => void;

/** Shared polling logic — pauses automatically when the tab is hidden. */
function useVisibilityPoll(gameId: string | undefined, onUpdate: PollCallback) {
  const callbackRef = useRef(onUpdate);
  useEffect(() => { callbackRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    if (!gameId) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => callbackRef.current(), POLL_INTERVAL);
    };

    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") start(); else stop();
    };

    // Only poll when tab is visible
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [gameId]);
}

/**
 * Polls for game updates every 5 seconds.
 * Pauses automatically when the browser tab is hidden (saves DB quota).
 */
export function useRealtimeGame(gameId: string | undefined, onUpdate: PollCallback) {
  useVisibilityPoll(gameId, onUpdate);
}

/**
 * Polls for lobby updates (player joins, game start).
 * Pauses automatically when the browser tab is hidden.
 */
export function useRealtimeLobby(gameId: string | undefined, onUpdate: PollCallback) {
  useVisibilityPoll(gameId, onUpdate);
}
