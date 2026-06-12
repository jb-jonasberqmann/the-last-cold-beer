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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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
    forTeam: "team-a",
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

  // ==========================================
  // TEAM B QUESTS — parallel track, same rooms, different riddles
  // ==========================================

  // THE KITCHEN — Team B
  {
    id: "b-kitchen-inspection",
    roomId: "kitchen",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Other Inspection",
    description:
      "Your team enters from the other side. The sticky note on the counter has been flipped over — someone left a message on the back. It reads: \"Spices on the shelf. Count only the ones that would actually belong at a cabin. Everything else is a lie.\"",
    prompt:
      "On the spice shelf: salt, pepper, paprika, cinnamon, cardamom, star anise, truffle oil, and saffron. Be honest — how many of those actually belong at a cabin weekend?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Think about what anyone actually uses at a cabin. Salt and pepper are obvious. Paprika maybe. The rest is wishful thinking.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Salt, pepper, paprika. Three. The rest belong in a cooking show, not a cabin.",
      },
    ],
    answer: { correct: ["3", "three"], normalized: true },
    rewardClueId: "clue-kitchen-calendar",
    rewardText:
      "Three honest spices. As you note them, you notice the wall calendar is open to a month circled in red. Something happened then.",
    failureText: "Be honest with yourself. This is a cabin, not a Michelin-star kitchen.",
  },
  {
    id: "b-kitchen-fridge-unlock",
    roomId: "kitchen",
    forTeam: "team-b",
    type: "unlock",
    title: "Approach the Fridge",
    description:
      "The fridge is humming at an unusual frequency. Your team can feel it before you touch the handle. Whatever is in there has been waiting. Pay the toll and open it.",
    prompt: "Pay the ritual cost to investigate the fridge.",
    order: 2,
    isRequired: true,
    offerCost: 2,
    hints: [],
    rewardText:
      "The door opens. Cold rushes out. One beer. Alone in the center. A note taped to it with tape so old it's almost transparent.",
  },
  {
    id: "b-kitchen-social",
    roomId: "kitchen",
    forTeam: "team-b",
    type: "social_challenge",
    title: "The Cabin Confession",
    description:
      "Your team must collectively confess one thing that happened on a previous cabin trip that was never officially acknowledged. The confession must be delivered by one person standing, using the phrase \"we never spoke of it\" at least once.",
    prompt:
      "One member delivers the Cabin Confession. Group votes on whether it is genuine, specific, and appropriately dramatic. If approved: bonus earned.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The cabin has heard. The cabin remembers. The unspoken is now spoken.",
  },

  // THE FRIDGE — Team B
  {
    id: "b-fridge-read-note",
    roomId: "fridge",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Other Note",
    description:
      "You lift the note from the beer. The handwriting is careful — deliberate. It says: \"The fridge was set to maximum because someone wanted to preserve something. Not the beer. Something else. What was it?\" Below that, a clue.",
    prompt:
      "\"I start with ice and end with evidence. I keep what shouldn't be thrown away. I am not food. I am not drink. What am I kept inside a fridge for preservation purposes?\" Answer: a specific type of document.",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "People keep receipts, photos, or written notes in the freezer to preserve them in an emergency. Think of the oldest, most important kind of document.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "A receipt. Specifically the receipt for last year's cabin trip — kept as evidence of who bought what and who still owes who.",
      },
    ],
    answer: { correct: ["receipt", "a receipt", "the receipt"], normalized: true },
    rewardClueId: "clue-fridge-note",
    rewardText: "A receipt. The note yields its secret — and points you to an old argument that was never resolved.",
    failureText: "The fridge hums. The note says nothing more yet.",
  },
  {
    id: "b-fridge-cold-investigation",
    roomId: "fridge",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Temperature Record",
    description:
      "The temperature dial is at maximum. But there's also a small log sheet taped to the inside wall — handwritten dates and temperatures. Someone was tracking this carefully.",
    prompt:
      "The log has five entries. Temperatures (in approximate °C): -5, -7, -8, -10, -14. What is the average of these five readings? Round to the nearest whole number.",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Add all five numbers together. Then divide by 5. Remember they are all negative.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "-5 + -7 + -8 + -10 + -14 = -44. Divided by 5 = -8.8. Rounded = -9.",
      },
    ],
    answer: { correct: ["-9", "minus 9", "-9°c", "-9 degrees"], normalized: true },
    rewardClueId: "clue-cold-timestamp",
    rewardText: "Minus nine degrees average. The log has meaning — and one date is circled.",
    failureText: "The numbers stare at you. Work through it step by step.",
  },
  {
    id: "b-fridge-temperature-dial",
    roomId: "fridge",
    forTeam: "team-b",
    type: "choice",
    title: "The Dial — Your Call",
    description:
      "The dial is at maximum. The beer is ice-cold. Your team has a decision: is this dedication to the ritual, evidence of someone hiding something, or simple carelessness?",
    prompt: "What is your team's verdict on the fridge temperature?",
    order: 3,
    isRequired: false,
    hints: [],
    choices: [
      {
        id: "b-dial-evidence",
        label: "Evidence — someone needed this cold for a reason",
        description: "The coldest setting was deliberate. Something needed preserving.",
        isCorrect: true,
        consequence: "Your instinct is sharp. Something needed to be kept cold that isn't just a beer. The ritual acknowledges your suspicion.",
      },
      {
        id: "b-dial-careless",
        label: "Careless — someone just forgot to turn it down",
        description: "The simplest explanation.",
        isCorrect: false,
        offerCost: 1,
        consequence: "Too simple. Pay 1 Offer for underestimating the ritual.",
      },
      {
        id: "b-dial-dedication",
        label: "Pure dedication — the coldest beer deserves the coldest setting",
        description: "Maximum respect for the Last Cold Beer.",
        isCorrect: false,
        consequence: "Admirable, but you've missed the clue underneath. Try again after more investigation.",
      },
    ],
    rewardText: "The cabin approves of your suspicious mind.",
  },

  // THE COFFEE TABLE — Team B
  {
    id: "b-coffee-table-ring",
    roomId: "coffee-table",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Other Ring",
    description:
      "You kneel beside the coffee table. There's a ring stain — but your eye goes to something underneath it. Someone scratched a calculation into the wood beneath the stain, barely visible. Three numbers multiplied together.",
    prompt:
      "Scratched into the wood under the ring stain: 3 × 4 × 7 = ? What is the result? And then: what time does that number represent if it's read as hours on a 24-hour clock?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "3 × 4 = 12. 12 × 7 = ?",
      },
      {
        order: 2,
        offerCost: 2,
        text: "3 × 4 × 7 = 84. On a 24-hour clock, 84 hours = 3 days and 12 hours = not useful. But 84 mod 24 = 12. So: noon. The answer is 84, or 'noon', or '12'.",
      },
    ],
    answer: { correct: ["84", "eighty four", "eighty-four", "noon", "12", "12:00"], normalized: true },
    rewardClueId: "clue-coffee-table-ring",
    rewardText: "84. Or noon. Something happened at noon — and now you have a number.",
    failureText: "The scratched numbers wait. Work through the multiplication.",
  },
  {
    id: "b-coffee-table-coaster",
    roomId: "coffee-table",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Coaster Poem",
    description:
      "Under the second coaster, your team finds not a code but a short poem, written in a hand that shook slightly: \"The first is what you came for. The last is what you leave. The middle is the number of things you cannot grieve.\" Three things. The middle one is a number.",
    prompt:
      "You came for the beer (1). You leave with a memory (1). The 'middle' that you cannot grieve — in the context of this cabin and the Last Cold Beer mystery — is the number of people who knew the combination. From the terrace initials: how many?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "You need to know the terrace clue. There were four sets of initials carved into the railing.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Four initials. Four people. The middle number is 4.",
      },
    ],
    answer: { correct: ["4", "four"], normalized: true },
    rewardClueId: "clue-coffee-table-coaster",
    rewardText: "Four. The number carved and the number of those who knew. The coaster surrenders its secret.",
    failureText: "Read the poem again. The middle thing — what number is it?",
  },
  {
    id: "b-coffee-table-social",
    roomId: "coffee-table",
    forTeam: "team-b",
    type: "social_challenge",
    title: "The Table Treaty",
    description:
      "The coffee table has witnessed every argument this group has ever had over a cabin trip. Your team must negotiate and announce a new cabin rule — one that would have prevented at least one real argument. It must be specific, enforceable, and slightly absurd.",
    prompt:
      "One team member proposes a new cabin rule. The full group votes on whether it is specific, enforceable, and funny enough to honor. Approved = bonus earned.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The new rule is added to the unofficial cabin constitution.",
  },

  // THE TERRACE — Team B
  {
    id: "b-terrace-railing-carving",
    roomId: "terrace",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Counting Ritual",
    description:
      "On the terrace railing — underside — the countdown is carved. But your team's investigation focuses on something different: four sets of initials. Each set of initials has a dot between them (J.B. style). Count the total number of dots across all four initials.",
    prompt:
      "The four initials are J.B., M.K., T.H., S.L. Each person's initials has exactly one dot between the letters. How many dots are there total across all four people's initials?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "J.B. = 1 dot. M.K. = 1 dot. T.H. = 1 dot. S.L. = 1 dot. Four people.",
      },
    ],
    answer: { correct: ["4", "four"], normalized: true },
    rewardClueId: "clue-terrace-inscription",
    rewardText: "Four dots. Four people. The inscription becomes part of your case file.",
    failureText: "Count carefully. How many dots between the initials?",
  },
  {
    id: "b-terrace-countdown",
    roomId: "terrace",
    forTeam: "team-b",
    type: "choice",
    title: "Who Carved It?",
    description:
      "\"5-4-3-2-1-0. The ritual completes at zero.\" Four sets of initials below. Your team must decide: was this carving made by one person on behalf of all four, or did all four carve it together?",
    prompt: "What is most likely about the origin of the carving?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 2, text: "Look at the quality of the carving. Is the depth and style consistent throughout?" },
    ],
    choices: [
      {
        id: "b-carved-together",
        label: "All four carved it together — a group ritual",
        description: "Each person carved their own initials as a pact.",
        isCorrect: true,
        consequence: "Exactly. Different depths, slightly different styles — four hands, one ritual. The countdown was a pact they each committed to.",
      },
      {
        id: "b-carved-one",
        label: "One person carved all of it, signing for the others",
        description: "One hand, one moment of commitment.",
        isCorrect: false,
        consequence: "Close, but the variations in carving depth suggest multiple hands. Not quite.",
      },
      {
        id: "b-carved-later",
        label: "Added later by someone who wasn't there",
        description: "A fake — added to mislead.",
        isCorrect: false,
        offerCost: 1,
        consequence: "No. The weathering of the wood matches. This was made at the same time. Pay 1 Offer for the detour.",
      },
    ],
    rewardText: "A group ritual. Four people. One countdown. One pact about the last cold beer.",
    failureText: "Look more carefully at the physical evidence.",
  },

  // THE SHED — Team B
  {
    id: "b-shed-unlock",
    roomId: "shed",
    forTeam: "team-b",
    type: "unlock",
    title: "Open the Shed",
    description:
      "The shed door is swollen from damp. It needs force — not brains, just commitment. Your team decides who goes and deals with it.",
    prompt: "Pay the ritual cost to enter the shed.",
    order: 1,
    isRequired: true,
    offerCost: 1,
    hints: [],
    rewardText: "The door gives. Inside: tools, junk, and pinned to the wall — an inventory sheet in a laminate sleeve.",
  },
  {
    id: "b-shed-inventory",
    roomId: "shed",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Item Count",
    description:
      "The CABIN INVENTORY sheet has 9 items listed. Item 7 is the cooler (locked). But your team notices something odd — two of the items on the list are duplicated under different names. Someone padded the inventory to confuse.",
    prompt:
      "If there are 9 listed items but 2 are duplicates of existing items, how many genuinely unique items are in the cabin inventory?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "9 items total. 2 are duplicates. 9 - 2 = ?" },
    ],
    answer: { correct: ["7", "seven"], normalized: true },
    rewardClueId: "clue-shed-inventory",
    rewardText: "Seven unique items. Item 7 is the cooler — and it's locked. You have what you need.",
    failureText: "Simple arithmetic. How many unique items remain when you remove the duplicates?",
  },
  {
    id: "b-shed-dedication",
    roomId: "shed",
    forTeam: "team-b",
    type: "social_challenge",
    title: "The Shed Eulogy",
    description:
      "The shed is dying slowly. The broken chair, the rusted tools, the paint roller hardened into a monument to forgotten projects. Your team must deliver a proper eulogy for ONE specific item in the shed. Not the shed itself — one item. At least 5 sentences. With genuine emotion.",
    prompt:
      "One member delivers a eulogy for a shed item of their choice. Minimum 5 sentences. The group decides by applause if it achieves genuine emotion. Success = bonus.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The item is remembered. The shed trembles slightly. Or it's just the wind.",
  },
];

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsByRoom(roomId: string, teamId?: "team-a" | "team-b"): Quest[] {
  return QUESTS
    .filter((q) => q.roomId === roomId && (!q.forTeam || !teamId || q.forTeam === teamId))
    .sort((a, b) => a.order - b.order);
}

export function getRequiredQuestsByRoom(roomId: string, teamId?: "team-a" | "team-b"): Quest[] {
  return getQuestsByRoom(roomId, teamId).filter((q) => q.isRequired);
}
