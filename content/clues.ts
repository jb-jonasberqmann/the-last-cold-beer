import type { Clue } from "@/types/content";

// ==========================================
// CHAPTER 1 CLUES — 8 total
// ==========================================
export const CLUES: Clue[] = [
  // --- Chapter 1 ---
  {
    id: "clue-fridge-note",
    chapterId: "chapter-1",
    title: "The Note",
    description:
      "A handwritten note on the beer. It reads: \"PROPERTY OF THE RITUAL. DO NOT OPEN BEFORE THE VERDICT. — The Committee.\" The handwriting is oddly neat. Someone planned this.",
    icon: "📝",
    flavor: "Someone brought a pen. Someone made a plan.",
    isKeyClue: true,
  },
  {
    id: "clue-cold-timestamp",
    chapterId: "chapter-1",
    title: "The Ice Formation",
    description:
      "The condensation pattern and ice crystal formation on the can suggests it has been in the fridge for at least 18 hours — meaning it was placed there before anyone arrived. Someone came early. Or never left.",
    icon: "🧊",
    flavor: "This beer has been waiting longer than anyone admits.",
    isKeyClue: false,
  },
  {
    id: "clue-kitchen-calendar",
    chapterId: "chapter-1",
    title: "The Cabin Calendar",
    description:
      "A paper calendar on the kitchen wall. One date is circled in red: last year's cabin trip weekend. Next to it, someone has written a single word in tiny letters: \"UNPAID.\"",
    icon: "📅",
    flavor: "A debt not forgotten. A score not settled.",
    isKeyClue: true,
  },
  {
    id: "clue-coffee-table-ring",
    chapterId: "chapter-1",
    title: "The Ring Mark",
    description:
      "A perfect ring stain on the coffee table. The diameter matches exactly one type of bottle. Next to it: a faint chalk outline that someone tried to rub away but didn't quite manage.",
    icon: "⭕",
    flavor: "Something was placed here deliberately. Someone marked the spot.",
    isKeyClue: false,
  },
  {
    id: "clue-terrace-inscription",
    chapterId: "chapter-1",
    title: "The Terrace Carving",
    description:
      "Carved into the underside of the terrace railing: \"5-4-3-2-1-0. The ritual completes at zero.\" Below that, four sets of initials. You recognize at least two of them.",
    icon: "🪵",
    flavor: "Someone carved this with intent. Someone knew they'd be back.",
    isKeyClue: true,
  },
  {
    id: "clue-shed-inventory",
    chapterId: "chapter-1",
    title: "The Shed Inventory",
    description:
      "A laminated sheet pinned to the shed wall: \"OFFICIAL CABIN INVENTORY — Last checked: last year's trip.\" At the bottom, in different handwriting: \"ITEM 7: THE COOLER. STATUS: Locked. COMBINATION: ??? — Ask the one who broke the pact.\"",
    icon: "📋",
    flavor: "Whoever made this knew there would be a mystery. They were ready.",
    isKeyClue: true,
  },
  {
    id: "clue-fridge-temperature",
    chapterId: "chapter-1",
    title: "The Temperature Setting",
    description:
      "The fridge dial has been turned to its maximum setting — far colder than you'd ever need for normal groceries. Someone set it specifically for preservation. The beer was meant to stay perfect until the right moment.",
    icon: "🌡️",
    flavor: "Someone wanted this beer to be impossibly cold. They succeeded.",
    isKeyClue: false,
  },
  {
    id: "clue-coffee-table-coaster",
    chapterId: "chapter-1",
    title: "The Coaster Code",
    description:
      "Tucked under a coaster: a small card with five symbols drawn in ballpoint pen. Each symbol corresponds to a letter if you know the Cabin Alphabet — a made-up code from three trips ago that only your group uses.",
    icon: "🃏",
    flavor: "This was made by someone who has been here before. Many times.",
    isKeyClue: true,
  },

  // --- Chapter 2 (stubs — content TBD) ---
  {
    id: "clue-group-chat-screenshot",
    chapterId: "chapter-2",
    title: "The Screenshot",
    description: "TODO: Chapter 2 clue content.",
    icon: "📱",
    flavor: "TODO",
    isKeyClue: true,
  },
  {
    id: "clue-receipt-discrepancy",
    chapterId: "chapter-2",
    title: "The Receipt",
    description: "TODO: Chapter 2 clue content.",
    icon: "🧾",
    flavor: "TODO",
    isKeyClue: false,
  },

  // --- Chapter 3 (stubs — content TBD) ---
  {
    id: "clue-final-ballot",
    chapterId: "chapter-3",
    title: "The Ballot",
    description: "TODO: Chapter 3 clue content.",
    icon: "🗳️",
    flavor: "TODO",
    isKeyClue: true,
  },
  {
    id: "clue-alphabet-key",
    chapterId: "chapter-3",
    title: "The Alphabet Key",
    description: "TODO: Chapter 3 clue content.",
    icon: "🔑",
    flavor: "TODO",
    isKeyClue: true,
  },
];

export function getClue(id: string): Clue | undefined {
  return CLUES.find((c) => c.id === id);
}

export function getCluesByChapter(chapterId: string): Clue[] {
  return CLUES.filter((c) => c.chapterId === chapterId);
}

export function getCluesByIds(ids: string[]): Clue[] {
  return ids.map((id) => CLUES.find((c) => c.id === id)).filter(Boolean) as Clue[];
}
