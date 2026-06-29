"use client";

import { createContext, useContext, type ReactNode } from "react";

// English-only — Danish locale removed.
export type Lang = "en";

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
}

const translations: Record<string, string> = {
  "nav.language": "Language",
  "room.required": "Required",
  "room.done": "✓ Done",
  "room.active": "Active",
  "room.bonus_unlocked": "+ bonus unlocked",
  "room.bonus_after": "+ bonus after",
  "room.clue_found": "🔍 New Clue Found!",
  "room.clue_dismiss": "Dismiss",
  "room.room_clues": "Room Clues",
  "room.clue_locked": "🔒 Clue not yet found",
  "room.all_done": "All challenges complete!",
  "room.all_done_sub": "Head back to the Quest Board to see if new rooms have unlocked.",
  "room.back_to_board": "← Back to Quest Board",
  "room.submit": "Submit",
  "room.answer_placeholder": "Your answer…",
  "room.solve_puzzle": "Solve Puzzle",
  "room.hint": "Hint",
  "room.skip": "Move on without completing →",
  "room.skipped": "skipped",
  "room.show": "Show",
  "room.challenge_done": "✓ Challenge Complete (Group Approved)",
  "room.pay_offer": "🍺 Pay",
  "room.offer_label": "Offer",
  "room.quest_type.puzzle": "puzzle",
  "room.quest_type.choice": "choice",
  "room.quest_type.social_challenge": "social challenge",
  "room.quest_type.unlock": "unlock",
  "room.quest_type.clue_check": "clue check",
  "boss.phase": "Phase",
  "boss.actions": "Available Actions",
  "boss.defeated_title": "Boss Defeated!",
  "boss.use_clue": "Use Clue →",
  "boss.applying_clue": "Applying…",
  "boss.clue_auto_title": "⚔️ Clues Ready to Strike",
  "boss.clue_auto_sub": "Your team found clues that deal direct damage. Apply them now.",
  "boss.clue_requires": "Requires clue:",
  "boss.solve_puzzle": "Solve Puzzle",
  "boss.answer_placeholder": "Answer…",
  "boss.submit": "Submit",
  "boss.group_decision": "✓ Group Decision Made",
  "boss.vs": "vs",
  "boss.locked_title": "Boss Locked",
  "boss.locked_message": "Complete all required chapter rooms before confronting this boss.",
  "boss.locked_requires": "Required:",
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string): string => translations[key] ?? key;
  const toggle = () => {}; // no-op — English only

  return (
    <LanguageContext.Provider value={{ lang: "en", toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
