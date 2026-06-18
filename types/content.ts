// Content types — describe the hardcoded game structure (chapters, rooms, quests, etc.)
// These types are never stored in the database; they live in /content/*.ts

export type TeamId = "team-a" | "team-b";

// ==========================================
// CHAPTER
// ==========================================
export interface Chapter {
  id: string; // e.g. "chapter-1"
  title: string;
  subtitle: string;
  description: string;
  order: number;
  bossId: string;
  roomIds: string[]; // ordered list of rooms in this chapter
  startingRoomIds: string[]; // rooms unlocked at chapter start (no cost)
  theme: ChapterTheme;
}

export interface ChapterTheme {
  primaryColor: string; // tailwind color key
  accentColor: string;
  backgroundClass: string;
  emoji: string;
}

// ==========================================
// ROOM
// ==========================================
export type RoomType = "mystery_room" | "boss_room";

export interface Room {
  id: string; // e.g. "kitchen"
  chapterId: string;
  title: string;
  type: RoomType;
  look: RoomLook;
  description: string; // shown when room is unlocked
  lockedDescription: string; // shown when room is still locked
  unlockCost: number; // Offer cost to unlock (0 = free / auto-unlocked)
  unlockRequires: string[]; // room IDs that must be completed first
  questIds: string[];
  rewardClueIds: string[]; // clues earned for completing this room
  isOptional: boolean;
  isSecret?: boolean; // secret branch — optional detour off main spine
  secretAdvantage?: string; // key describing boss advantage granted on completion
  order: number; // display order in quest board
  da?: RoomDa; // Danish locale overrides
}

// Danish locale override — only fields that differ from English
export interface RoomDa {
  title?: string;
  description?: string;
  lockedDescription?: string;
  atmosphere?: string;
}

export interface RoomLook {
  icon: string; // emoji
  theme: string; // key from tailwind config
  atmosphere: string; // one or two sentence mood text
  backgroundStyle: string; // css class hint
  colorFrom: string; // tailwind gradient from
  colorTo: string; // tailwind gradient to
}

// ==========================================
// QUEST
// ==========================================
export type QuestType =
  | "puzzle" // answer a code or riddle
  | "choice" // pick one of N options (one is correct or best)
  | "social_challenge" // judged by the group
  | "unlock" // pay Offer to unlock something
  | "clue_check" // requires a specific previously found clue
  | "boss_phase"; // used inside boss encounters

export interface Quest {
  id: string;
  roomId: string;
  forTeam?: TeamId; // if set, only this team sees this quest
  type: QuestType;
  title: string;
  description: string; // the scenario / flavor text
  prompt: string; // the actual question or challenge
  order: number;
  isRequired: boolean; // must complete to mark room complete
  hints: Hint[];
  answer?: QuestAnswer; // undefined for social challenges
  choices?: QuestChoice[]; // for type === 'choice'
  offerCost?: number; // for type === 'unlock' — cost to resolve
  rewardClueId?: string; // clue granted on completion
  rewardText?: string; // flavor text shown on success
  failureText?: string; // shown on wrong answer (before hint)
  da?: QuestDa; // Danish locale overrides
}

// Danish locale override — only fields that differ from English
export interface QuestDa {
  title?: string;
  description?: string;
  prompt?: string;
  hints?: string[]; // 0-indexed, replaces hints[i].text
  choices?: Record<string, { label?: string; description?: string; consequence?: string }>;
  rewardText?: string;
  failureText?: string;
}

export interface QuestAnswer {
  correct: string | string[]; // accepted answers (case-insensitive)
  normalized?: boolean; // if true, strip spaces/punctuation before comparing
}

export interface QuestChoice {
  id: string;
  label: string;
  description: string;
  isCorrect: boolean;
  offerCost?: number; // some wrong choices also cost Offer
  consequence?: string; // flavor text for this choice
}

export interface Hint {
  order: number; // 1 = first hint, 2 = second, etc.
  offerCost: number;
  text: string;
}

// ==========================================
// CLUE
// ==========================================
export interface Clue {
  id: string;
  chapterId: string;
  title: string;
  description: string; // the clue content — shown in Case File
  icon: string; // emoji
  flavor: string; // atmospheric one-liner shown when discovered
  isKeyClue: boolean; // required for boss or final reveal
  revealedTo?: TeamId; // if set, only this team can see contents initially
  da?: ClueDa; // Danish locale overrides
}

// Danish locale override
export interface ClueDa {
  title?: string;
  description?: string;
  flavor?: string;
}

// ==========================================
// BOSS
// ==========================================
export interface Boss {
  id: string;
  chapterId: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  look: BossLook;
  maxHp: number;
  phases: BossPhase[];
  defeatText: string; // shown when boss is defeated
  victoryAdvantage: string; // advantage granted to the winning team in next chapter
  requiredRoomIds?: string[]; // rooms that must be complete before boss is accessible
  da?: BossDa; // Danish locale overrides
}

// Danish locale override — nested by phase number and action id
export interface BossDa {
  title?: string;
  subtitle?: string;
  description?: string;
  atmosphere?: string;
  defeatText?: string;
  victoryAdvantage?: string;
  phases?: Array<{
    phase: number;
    title?: string;
    description?: string;
    actions?: Array<{
      id: string;
      label?: string;
      description?: string;
      puzzlePrompt?: string;
      hint?: string;
      rewardText?: string;
      failureText?: string;
    }>;
  }>;
}

export interface BossLook {
  icon: string;
  atmosphere: string;
  colorFrom: string;
  colorTo: string;
  backgroundStyle: string;
}

export interface BossPhase {
  phase: number; // 1-indexed
  title: string;
  description: string;
  hpThreshold: number; // boss enters this phase when HP drops to this %
  actions: BossAction[];
}

export interface BossAction {
  id: string;
  label: string;
  description: string;
  type: "puzzle" | "offer_boost" | "clue_check" | "social";
  damage: number; // HP removed on success
  offerCost?: number;
  requiredClueId?: string; // clue_check type
  puzzle?: {
    prompt: string;
    answer: string | string[];
  };
  hint?: string;
  rewardText?: string;
  failureText?: string;
}
