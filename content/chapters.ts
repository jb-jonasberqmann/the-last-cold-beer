import type { Chapter } from "@/types/content";

export const CHAPTERS: Chapter[] = [
  {
    id: "chapter-1",
    title: "Arrival",
    subtitle: "Something is wrong with the fridge.",
    description:
      "The cars are parked. The bags are dumped. Someone has already claimed the best bed. And there, alone in the otherwise empty fridge, is a single beer — perfectly cold, covered in condensation — with a handwritten note taped to it: \"Only the worthy may open me.\" No one admits to putting it there.",
    order: 1,
    bossId: "locked-cooler",
    roomIds: ["kitchen", "fridge", "coffee-table", "terrace", "shed"],
    startingRoomIds: ["kitchen"], // kitchen is free, others must be unlocked
    theme: {
      primaryColor: "amber",
      accentColor: "blue",
      backgroundClass: "from-amber-950 to-amber-900",
      emoji: "🏡",
    },
  },
  {
    id: "chapter-2",
    title: "Suspicion",
    subtitle: "The cabin remembers what happened.",
    description:
      "Last year's trip left scars. Someone broke the pact. The cabin has not forgotten. As you dig deeper into the mystery, old receipts and dead group chats start to tell a different story than the one you remember.",
    order: 2,
    bossId: "fake-bottle-opener",
    roomIds: [
      "old-group-chat",
      "garden-chair",
      "store-receipt",
      "false-alibi",
      "playlist-from-hell",
    ],
    startingRoomIds: ["old-group-chat"],
    theme: {
      primaryColor: "purple",
      accentColor: "amber",
      backgroundClass: "from-purple-950 to-purple-900",
      emoji: "🕵️",
    },
  },
  {
    id: "chapter-3",
    title: "Judgement",
    subtitle: "The truth must be uncovered.",
    description:
      "The final night. Every clue points somewhere. Every alibi has a hole. One team must face the Last Cold Beer itself — and account for what was done. The cabin demands a verdict.",
    order: 3,
    bossId: "last-cold-beer",
    roomIds: [
      "rules-of-the-ritual",
      "final-ballot",
      "alphabet-of-caps",
      "missing-tradition",
      "nightstand-secret",
    ],
    startingRoomIds: ["rules-of-the-ritual"],
    theme: {
      primaryColor: "green",
      accentColor: "red",
      backgroundClass: "from-green-950 to-stone-900",
      emoji: "⚖️",
    },
  },
];

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getChapterByOrder(order: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.order === order);
}
