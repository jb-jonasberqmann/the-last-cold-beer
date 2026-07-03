import type { Chapter } from "@/types/content";

export const CHAPTERS: Chapter[] = [
  // ==========================================
  // ACT 1 — THE ARRIVAL
  // Outside. Late afternoon. Golden hour.
  // ==========================================
  {
    id: "act-1",
    title: "The Arrival",
    subtitle: "Mads is late. The key box has a code. Nobody knows the code.",
    description:
      "The cars are parked. Bags on the gravel. The summerhouse is right there — but the front door has a key box, and the only person with the code isn't answering his phone. You explore the garden, the terrace, the shed. Something out here doesn't add up.",
    order: 1,
    bossId: "mads",
    roomIds: ["driveway", "terrace", "garden", "shed", "petanque-court", "front-door", "carport"],
    startingRoomIds: ["driveway"],
    theme: {
      primaryColor: "amber",
      accentColor: "green",
      backgroundClass: "from-amber-950 to-stone-950",
      emoji: "🌅",
    },
  },

  // ==========================================
  // ACT 2 — SETTLING IN
  // Inside. Evening. Warm lamplight.
  // ==========================================
  {
    id: "act-2",
    title: "Settling In",
    subtitle: "Three bedrooms. Three stories. One radio that won't stop crackling.",
    description:
      "The door is open. People find their rooms. The house is warm and smells of pine and old summers. But the radio in the dining room has been crackling since you walked in — and the static isn't quite random.",
    order: 2,
    bossId: "the-radio",
    roomIds: [
      "double-room", "single-room", "bunk-room",
      "living-room", "sunroom",
      "dining-room", "kitchen-act2", "the-toilet", "activity-room",
      "darts-board", "foosball-table",
    ],
    startingRoomIds: ["double-room", "single-room", "bunk-room"],
    theme: {
      primaryColor: "orange",
      accentColor: "amber",
      backgroundClass: "from-stone-900 to-amber-950",
      emoji: "🏠",
    },
  },

  // ==========================================
  // ACT 3 — THE LATE NIGHT
  // Full property. Darkness.
  // ==========================================
  {
    id: "act-3",
    title: "The Late Night",
    subtitle: "The house goes dark. You already know the way.",
    description:
      "The house is dark. The radio is silent. You are in the dining room and the lights don't work. Everything you found tonight is about to mean something different.",
    order: 3,
    bossId: "yourselves",
    roomIds: [
      "dining-room-dark", "utility-corner",
      "back-corridor", "fuse-box",
      "kitchen-dark", "broken-window",
      "door-nobody-tried", "sealed-wall",
      "behind-the-shed", "conservatory", "shed-dark",
      "living-room-boss",
    ],
    startingRoomIds: ["dining-room-dark"],
    theme: {
      primaryColor: "stone",
      accentColor: "red",
      backgroundClass: "from-stone-950 to-zinc-950",
      emoji: "🕯️",
    },
  },
];

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getChapterByOrder(order: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.order === order);
}
