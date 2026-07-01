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
  unlockRequiresArtifacts?: string[]; // artifact clue IDs team must hold before entering
  questIds: string[];
  rewardClueIds: string[]; // clues earned for completing this room
  isOptional: boolean;
  isSingleOccupancy?: boolean; // Act 2 bedrooms — only one player per team can enter
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
  | "boss_phase" // used inside boss encounters
  | "sliding_puzzle" // interactive tile-sliding puzzle
  | "physical_challenge"; // real-world timed activity broadcast to all players

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
  slidingPuzzle?: SlidingPuzzleConfig; // for type === 'sliding_puzzle'
  physicalChallenge?: PhysicalChallengeConfig; // for type === 'physical_challenge'
  offerCost?: number; // for type === 'unlock' — cost to resolve
  rewardClueId?: string; // clue granted on completion
  rewardText?: string; // flavor text shown on success
  failureText?: string; // shown on wrong answer (before hint)
  setsScaredSilent?: boolean; // if true, completing this quest sets the player's scared_silent flag
  clearsScaredSilent?: boolean; // if true, completing this room clears scared_silent for the team
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

export interface SlidingPuzzleConfig {
  size: 3 | 4; // 3×3 (8-puzzle) or 4×4 (15-puzzle)
  label: string; // shown above the grid e.g. "Arrange the tools"
  solvedText: string; // flavor text shown when solved
}

export interface PhysicalChallengeConfig {
  timerSeconds: number; // how long the challenge runs
  startLabel: string; // button label to kick off the challenge e.g. "Send to Hammock"
  activeEmoji: string; // emoji shown in the running banner e.g. "🏕"
  bannerText: string; // short text shown in team-wide countdown banner e.g. "Someone is in the hammock"
  completeLabel: string; // "Back from Hammock — Report In"
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
  isArtifact?: boolean; // artifact items (flashlight, fuse, wrench, candle, final note)
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
  counterAttacks?: BossCounterAttack[]; // boss responds after each successful player action
  defeatText: string; // shown when boss is defeated
  victoryAdvantage: string; // advantage granted to the winning team in next chapter
  requiredRoomIds?: string[]; // rooms that must be complete before boss is accessible
  da?: BossDa; // Danish locale overrides
}

export interface BossCounterAttack {
  id: string;           // "defend" | "attack" | "heal"
  label: string;        // short display name
  description: string;  // narrative shown to players
  weight: number;       // relative draw weight (integers, e.g. 3/2/1 out of total)
  effect: {
    type: "defend" | "attack" | "heal";
    defenseMultiplier?: number; // 0.75 → next player hit does 75% damage (one-shot, consumed on use)
    teamOfferDamage?: number;   // sips team must drink (offer cost charged to team)
    healPercent?: number;       // fraction of maxHp healed (e.g. 0.20 = 20%)
    isOnce?: boolean;           // can only trigger once per fight
  };
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
  type: "puzzle" | "offer_boost" | "clue_check" | "social" | "choice";
  damage: number; // HP removed on success
  offerCost?: number;
  requiredClueId?: string; // clue_check type
  puzzle?: {
    prompt: string;
    answer: string | string[];
  };
  choices?: BossActionChoice[]; // for type === 'choice'
  physicalChallenge?: PhysicalChallengeConfig; // optional timer overlay (used alongside puzzle type)
  hint?: string;
  rewardText?: string;
  failureText?: string;
}

export interface BossActionChoice {
  id: string;
  label: string;
  description: string;
  isCorrect: boolean;
  consequence?: string;
}
