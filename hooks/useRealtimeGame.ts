"use client";

import { useEffect, useRef, useCallback } from "react";

const POLL_INTERVAL = 5000; // 5 seconds — reduces DB load; fast enough for a party game

type PollCallback = () => void;

/**
 * Polls for game updates every 3 seconds.
 * Replaces the Supabase realtime subscription.
 * Calls onUpdate on each tick so callers can re-fetch their data.
 */
export function useRealtimeGame(
  gameId: string | undefined,
  onUpdate: PollCallback
) {
  const callbackRef = useRef(onUpdate);
  useEffect(() => { callbackRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    if (!gameId) return;

    const timer = setInterval(() => {
      callbackRef.current();
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [gameId]);
}

/**
 * Polls for lobby updates (player joins, game start).
 */
export function useRealtimeLobby(
  gameId: string | undefined,
  onUpdate: PollCallback
) {
  const callbackRef = useRef(onUpdate);
  useEffect(() => { callbackRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    if (!gameId) return;

    const timer = setInterval(() => {
      callbackRef.current();
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [gameId]);
}
