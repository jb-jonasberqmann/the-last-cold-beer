"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "da";

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // — Nav / Layout —
  "nav.language": { en: "DA", da: "EN" },

  // — Room page —
  "room.required": { en: "Required", da: "Påkrævet" },
  "room.done": { en: "✓ Done", da: "✓ Fuldført" },
  "room.active": { en: "Active", da: "Aktiv" },
  "room.bonus_unlocked": { en: "+ bonus unlocked", da: "+ bonus låst op" },
  "room.bonus_after": { en: "+ bonus after", da: "+ bonus efter" },
  "room.clue_found": { en: "🔍 New Clue Found!", da: "🔍 Nyt spor fundet!" },
  "room.clue_dismiss": { en: "Dismiss", da: "Luk" },
  "room.room_clues": { en: "Room Clues", da: "Rummets spor" },
  "room.clue_locked": { en: "🔒 Clue not yet found", da: "🔒 Spor endnu ikke fundet" },
  "room.all_done": { en: "All challenges complete!", da: "Alle udfordringer klaret!" },
  "room.all_done_sub": {
    en: "Head back to the Quest Board to see if new rooms have unlocked.",
    da: "Gå tilbage til kortbrættet og se om nye rum er låst op.",
  },
  "room.back_to_board": { en: "← Back to Quest Board", da: "← Tilbage til kortbrættet" },
  "room.submit": { en: "Submit", da: "Indsend" },
  "room.answer_placeholder": { en: "Your answer…", da: "Dit svar…" },
  "room.solve_puzzle": { en: "Solve Puzzle", da: "Løs gåden" },
  "room.hint": { en: "Hint", da: "Vink" },
  "room.skip": { en: "Move on without completing →", da: "Fortsæt uden at fuldføre →" },
  "room.skipped": { en: "skipped", da: "sprunget over" },
  "room.show": { en: "Show", da: "Vis" },
  "room.challenge_done": { en: "✓ Challenge Complete (Group Approved)", da: "✓ Udfordring klaret (gruppen godkender)" },
  "room.pay_offer": { en: "🍺 Pay", da: "🍺 Betal" },
  "room.offer_label": { en: "Offer", da: "Offer" },
  "room.quest_type.puzzle": { en: "puzzle", da: "gåde" },
  "room.quest_type.choice": { en: "choice", da: "valg" },
  "room.quest_type.social_challenge": { en: "social challenge", da: "social udfordring" },
  "room.quest_type.unlock": { en: "unlock", da: "oplåsning" },
  "room.quest_type.clue_check": { en: "clue check", da: "sporstjek" },

  // — Boss page —
  "boss.phase": { en: "Phase", da: "Fase" },
  "boss.actions": { en: "Available Actions", da: "Tilgængelige handlinger" },
  "boss.defeated_title": { en: "Boss Defeated!", da: "Boss besejret!" },
  "boss.use_clue": { en: "Use Clue →", da: "Anvend spor →" },
  "boss.applying_clue": { en: "Applying…", da: "Anvender…" },
  "boss.clue_auto_title": { en: "⚔️ Clues Ready to Strike", da: "⚔️ Spor klar til angreb" },
  "boss.clue_auto_sub": {
    en: "Your team found clues that deal direct damage. Apply them now.",
    da: "Jeres hold har fundet spor der giver direkte skade. Anvend dem nu.",
  },
  "boss.clue_requires": { en: "Requires clue:", da: "Kræver spor:" },
  "boss.solve_puzzle": { en: "Solve Puzzle", da: "Løs gåden" },
  "boss.answer_placeholder": { en: "Answer…", da: "Svar…" },
  "boss.submit": { en: "Submit", da: "Indsend" },
  "boss.group_decision": { en: "✓ Group Decision Made", da: "✓ Gruppeafgørelse truffet" },
  "boss.vs": { en: "vs", da: "vs" },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("tlcb_lang") as Lang | null;
    if (stored === "en" || stored === "da") setLang(stored);
  }, []);

  const toggle = () => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "da" : "en";
      localStorage.setItem("tlcb_lang", next);
      return next;
    });
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
