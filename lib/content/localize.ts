/**
 * Localization helpers — English only. All functions return base English content.
 * The `lang` parameter is accepted for API compatibility but ignored.
 */

import type { Quest, Room, Clue, Boss } from "@/types/content";

export function localizeQuest(quest: Quest, _lang?: string): Quest {
  return quest;
}

export function localizeQuests(quests: Quest[], _lang?: string): Quest[] {
  return quests;
}

export function localizeRoom(room: Room, _lang?: string): Room {
  return room;
}

export function localizeClue(clue: Clue, _lang?: string): Clue {
  return clue;
}

export function localizeBoss(boss: Boss, _lang?: string): Boss {
  return boss;
}
