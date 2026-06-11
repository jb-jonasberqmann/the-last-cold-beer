import type { Quest } from "@/types/content";

// ==========================================
// CHAPTER 1 QUESTS
// Each room has 2+ quests. Required quests must be completed to mark room done.
// Offer costs are meaningful — minimum 1 Offer per hint, 2–3 for unlocks.
// ==========================================

export const QUESTS: Quest[] = [
  // ==========================================
  // THE KITCHEN — 3 quests
  // ==========================================
  {
    id: "kitchen-inspection",
    roomId: "kitchen",
    type: "puzzle",
    title: "The First Inspection",
    description:
      "You walk into the kitchen. The lights flicker once. Everything looks normal — except the fridge is humming louder than it should. On the counter, someone left a sticky note. It says: \"Count the magnets. Subtract the ones that don't belong.\"",
    prompt:
      "There are 11 magnets on the fridge. 3 of them are shaped like beer bottles, 2 are shaped like tiny pineapples, and the rest are letters. The pineapples are clearly from a different fridge in a different life. How many magnets belong?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "\"Don't belong\" means the pineapples. They have no business being here.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "11 total. 2 pineapples don't belong. 11 - 2 = ?",
      },
    ],
    answer: {
      correct: ["9", "nine"],
      normalized: true,
    },
    rewardClueId: "clue-kitchen-calendar",
    rewardText:
      "As you count the magnets, your eye drifts to the wall calendar. Something's marked. Something old.",
    failureText: "The magnets stare back at you. Pineapples have no place in this cabin.",
  },
  {
    id: "kitchen-fridge-unlock",
    roomId: "kitchen",
    type: "unlock",
    title: "Open the Fridge",
    description:
      "The fridge stands before you. Cold air seeps under the door. You can hear it — the faint, distant hum of something impossibly chilled. Pay the toll and open it.",
    prompt: "The fridge won't open itself. Pay the ritual cost to investigate.",
    order: 2,
    isRequired: true,
    offerCost: 2,
    hints: [],
    rewardText:
      "The door swings open. Cold air rushes out. There it is — one single beer, alone in the center, covered in condensation. A note is taped to it.",
  },
  {
    id: "kitchen-social",
    roomId: "kitchen",
    type: "social_challenge",
    title: "The Cabin Welcome Toast",
    description:
      "Every good cabin trip starts the same way. Someone has to give the welcome toast. It must reference at least one person who is NOT present, end with a countdown, and contain the word \"fridge\".",
    prompt:
      "One team member gives a welcome toast. The other team judges if it meets the requirements. Judge by group vote. If the toast is accepted, earn the bonus.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "A worthy toast. The cabin acknowledges your arrival.",
    failureText: "The cabin is unmoved. Try harder next time.",
  },

  // ==========================================
  // THE FRIDGE — 3 quests
  // ==========================================
  {
    id: "fridge-read-note",
    roomId: "fridge",
    type: "puzzle",
    title: "Read the Note",
    description:
      "You lift the note from the beer. It's handwritten. Something about the ink looks deliberate — not hurried. The note says: \"Only the worthy may open me. First: prove you remember the number.\" Below that: a riddle.",
    prompt:
      "\"I am the number of beers you were supposed to bring last year. You brought two fewer. What number am I?\" — The correct answer is whatever your group actually agreed on. If you can't remember, pay for the truth.",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "Ask the oldest person in the group. They remember everything, especially the things you owe.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "For the purposes of this game: the answer is 6. Someone agreed to bring 6 beers and showed up with 4.",
      },
    ],
    answer: {
      correct: ["6", "six"],
      normalized: true,
    },
    rewardClueId: "clue-fridge-note",
    rewardText: "Correct. The note seems satisfied. It yields one of its secrets.",
    failureText:
      "The note says nothing. The beer remains cold. The fridge hums, unimpressed.",
  },
  {
    id: "fridge-cold-investigation",
    roomId: "fridge",
    type: "puzzle",
    title: "The Impossible Cold",
    description:
      "The fridge temperature dial is turned to its maximum. This beer has been cold for a very, very long time. You need to determine how long.",
    prompt:
      "The condensation ring under the beer perfectly matches the ring stain you noticed elsewhere in the cabin. Where was that ring stain?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "You need to visit another room to confirm this. Check somewhere people usually put drinks.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "The coffee table. There's a ring stain on the coffee table that matches perfectly.",
      },
    ],
    answer: {
      correct: ["coffee table", "coffee-table", "the coffee table", "table"],
      normalized: true,
    },
    rewardClueId: "clue-cold-timestamp",
    rewardText:
      "The measurements match. This beer traveled. It's been waiting for exactly the right time.",
    failureText:
      "You're not sure. The beer says nothing. The fridge hums louder.",
  },
  {
    id: "fridge-temperature-dial",
    roomId: "fridge",
    type: "choice",
    title: "The Dial Decision",
    description:
      "The dial is at maximum. The beer is already at optimal coldness — maybe beyond optimal. If you turn the dial down now, you might save electricity. If you leave it, the beer stays exactly as the ritual intended.",
    prompt: "What does your team do with the temperature dial?",
    order: 3,
    isRequired: false,
    hints: [],
    choices: [
      {
        id: "dial-leave",
        label: "Leave it exactly as found",
        description: "Respect the ritual. The cold is intentional.",
        isCorrect: true,
        consequence:
          "Wise. The ritual respects those who respect the ritual. A small advantage is noted.",
      },
      {
        id: "dial-turn-down",
        label: "Turn it down — electricity is expensive",
        description: "Practical. Slightly boring.",
        isCorrect: false,
        offerCost: 1,
        consequence:
          "The ritual is disappointed. Pay 1 Offer in acknowledgment of your pragmatism.",
      },
      {
        id: "dial-turn-up",
        label: "Turn it higher — make it colder",
        description: "Maximum cold for maximum ritual.",
        isCorrect: false,
        offerCost: 2,
        consequence:
          "The fridge makes a worrying noise. Pay 2 Offer for your hubris. The beer respects the commitment, but not the execution.",
      },
    ],
    rewardText: "The cabin hums with approval.",
  },

  // ==========================================
  // THE COFFEE TABLE — 3 quests
  // ==========================================
  {
    id: "coffee-table-ring",
    roomId: "coffee-table",
    type: "puzzle",
    title: "The Ring Mark",
    description:
      "You crouch beside the coffee table. There it is — a perfect ring stain, slightly faded, with a faint chalk outline around it. Someone marked this spot deliberately. The outline was made to be found.",
    prompt:
      "Measure the diameter of the ring mark (in centimeters, roughly) and compare it to the beer in the fridge. What is your verdict: is this the same bottle?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "You don't need a ruler. Hold the beer can near the ring. Does it match? Trust your eyes.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "For the purposes of this game: yes. The diameter matches. The beer was placed here first, then moved to the fridge. Someone staged this location.",
      },
    ],
    answer: {
      correct: ["yes", "same", "match", "matches", "it matches", "the same"],
      normalized: true,
    },
    rewardClueId: "clue-coffee-table-ring",
    rewardText:
      "The mark confirms it. The beer has a history in this room. Something was planned here.",
    failureText: "The ring says nothing. Try a different approach.",
  },
  {
    id: "coffee-table-coaster",
    roomId: "coffee-table",
    type: "puzzle",
    title: "The Hidden Coaster",
    description:
      "You lift each coaster on the table. Under the third one — of course it's the third one — you find a small card with five symbols drawn in pen. You recognize this immediately: it's the Cabin Alphabet, the made-up code your group invented three trips ago.",
    prompt:
      "Decode the symbols: ▲ □ ● ▲ ■ . In the Cabin Alphabet, ▲ = A, □ = S, ● = K, ■ = E. What word does this spell?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Go symbol by symbol. ▲ □ ● ▲ ■. Use the key provided.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "A-S-K-A-E? Wait. Try: A-S-K... hmm. The fourth symbol is ▲ again = A. Fifth is ■ = E. A-S-K-A-E? That's not a word. Unless... it's a name.",
      },
    ],
    answer: {
      correct: ["askae", "ask ae", "ask a-e"],
      normalized: true,
    },
    rewardClueId: "clue-coffee-table-coaster",
    rewardText:
      "ASKAE. Not a word. A name? An acronym? Initials? Something to keep in the case file.",
    failureText: "The symbols remain a puzzle. Try again — or pay for the answer.",
  },
  {
    id: "coffee-table-social",
    roomId: "coffee-table",
    type: "social_challenge",
    title: "The Cabin Oath",
    description:
      "The coffee table has clearly seen a lot of cabin trips. It deserves respect. One team member must ceremonially apologize to the coffee table for all past damage done to it, in a formal tone, for at least 20 seconds. The other team and group judges.",
    prompt:
      "One team member performs a formal apology to the coffee table. Duration: at least 20 seconds. Tone: formal, sincere, slightly absurd. Judged by group applause.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The table seems satisfied. Or at least, it stops judging you.",
  },

  // ==========================================
  // THE TERRACE — 2 quests
  // ==========================================
  {
    id: "terrace-railing-carving",
    roomId: "terrace",
    type: "puzzle",
    title: "The Underside Carving",
    description:
      "Someone told you to check the underside of the terrace railing. You lean over and look — and there it is, carved carefully into the wood: \"5-4-3-2-1-0. The ritual completes at zero.\" Below that, four sets of initials.",
    prompt:
      "Write down all four sets of initials you find carved into the railing. Submit them exactly as written (comma-separated, uppercase). Note: this requires actually going and looking — or someone in your group must know.",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "Go outside and actually look at the underside of the railing nearest to the main cabin door. The carving is real — or rather, for the game, one person in the group must go check the spot and report back.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "If the cabin doesn't have a railing carving (most don't — this is a game, after all), the initials are: J.B., M.K., T.H., S.L. Write them in the case file.",
      },
    ],
    answer: {
      correct: ["j.b., m.k., t.h., s.l.", "jb mk th sl", "j.b. m.k. t.h. s.l."],
      normalized: true,
    },
    rewardClueId: "clue-terrace-inscription",
    rewardText:
      "The initials. Four people who were here before. Four people who knew about the ritual.",
    failureText:
      "You stare at the railing. The carving says nothing useful yet. Look harder — or pay.",
  },
  {
    id: "terrace-countdown",
    roomId: "terrace",
    type: "choice",
    title: "The Countdown Meaning",
    description:
      "\"5-4-3-2-1-0. The ritual completes at zero.\" What does the countdown refer to? Your team must choose the most likely interpretation based on the clues so far.",
    prompt:
      "What does 5-4-3-2-1-0 most likely represent in the context of the Last Cold Beer mystery?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "Think about what's being counted down. Not time. Not lives. Something that gets consumed over a trip.",
      },
    ],
    choices: [
      {
        id: "countdown-beers",
        label: "Number of beers remaining",
        description: "A countdown of beers, ending when the last one is opened.",
        isCorrect: true,
        consequence:
          "Exactly right. The last cold beer is number zero — the final one. The ritual demands it be opened only at the right moment.",
      },
      {
        id: "countdown-days",
        label: "Days of the cabin trip",
        description: "A five-day countdown to something on the last day.",
        isCorrect: false,
        consequence: "Plausible, but the clues point elsewhere. Not wrong, but not the answer.",
      },
      {
        id: "countdown-people",
        label: "Number of people at the original ritual",
        description: "Five people who knew, down to zero who remained silent.",
        isCorrect: false,
        offerCost: 1,
        consequence:
          "A creative interpretation. Not the answer, but interesting enough that you must pay 1 Offer for the detour.",
      },
    ],
    rewardText: "The countdown makes sense now. The last cold beer is number zero.",
    failureText: "Interesting theory. But not quite right.",
  },

  // ==========================================
  // THE SHED — 3 quests
  // ==========================================
  {
    id: "shed-unlock",
    roomId: "shed",
    type: "unlock",
    title: "Force the Shed Door",
    description:
      "The shed door is stuck — not locked, just swollen from the damp. It needs a firm push. Or, more accurately, it needs someone to decide to commit to pushing it.",
    prompt:
      "Pay the ritual cost to investigate the shed. This represents someone actually going and dealing with the door.",
    order: 1,
    isRequired: true,
    offerCost: 1,
    hints: [],
    rewardText:
      "The door gives. Inside: the usual cabin junk — old tools, a broken chair, a laminated inventory sheet pinned to the wall. The sheet gets your attention immediately.",
  },
  {
    id: "shed-inventory",
    roomId: "shed",
    type: "puzzle",
    title: "The Inventory Sheet",
    description:
      "You pull the laminated sheet off the wall. It's an official-looking \"CABIN INVENTORY\" — someone made this with a label maker and a sense of ceremony. At the bottom, in different handwriting: \"ITEM 7: THE COOLER. STATUS: Locked. COMBINATION: ??? — Ask the one who broke the pact.\"",
    prompt:
      "According to the inventory sheet, what is Item 7, and what is its listed status?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Read the sheet. It's right there on the laminate. The question is a reading comprehension test disguised as a mystery.",
      },
    ],
    answer: {
      correct: [
        "the cooler, locked",
        "cooler, locked",
        "the cooler is locked",
        "cooler locked",
        "item 7 is the cooler and it's locked",
      ],
      normalized: true,
    },
    rewardClueId: "clue-shed-inventory",
    rewardText:
      "The Cooler. Locked. Combination unknown. And whoever knows is \"the one who broke the pact.\" Now you have a direction.",
    failureText: "You squint at the inventory. The answer is literally printed on it.",
  },
  {
    id: "shed-dedication",
    roomId: "shed",
    type: "social_challenge",
    title: "The Shed Offering",
    description:
      "The shed contains a broken garden chair, a rusted trowel, one empty beer can from last year (vintage!), and what appears to be a paint roller used once and never cleaned. This junk deserves an inventory poem.",
    prompt:
      "One team member must recite an original poem (at least 4 lines) dedicated to the contents of the shed. Rhyming optional. Sincerity mandatory. The group votes on whether it honors the shed.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText:
      "The shed is honored. Somewhere, the spirit of the uncleaned paint roller rests easier.",
  },
];

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsByRoom(roomId: string): Quest[] {
  return QUESTS.filter((q) => q.roomId === roomId).sort((a, b) => a.order - b.order);
}

export function getRequiredQuestsByRoom(roomId: string): Quest[] {
  return getQuestsByRoom(roomId).filter((q) => q.isRequired);
}
