import type { Boss } from "@/types/content";

export const BOSSES: Boss[] = [
  // ==========================================
  // CHAPTER 1 BOSS — The Locked Cooler
  // 4 phases, 100 HP
  // ==========================================
  {
    id: "locked-cooler",
    chapterId: "chapter-1",
    title: "The Locked Cooler",
    subtitle: "It has waited for this moment.",
    description:
      "Behind the shed — or maybe it was always there — sits a large cooler with a combination lock. The lock is old. The cooler hums faintly, which is suspicious because it's not plugged in. The combination is somewhere in the clues your team has gathered. You hope.",
    icon: "🧊",
    look: {
      icon: "🔒",
      atmosphere:
        "The cooler sits in the dim light of the back room. The combination lock dial has worn numbers. It doesn't move when you try to open it. Something inside shifts — gently, deliberately.",
      colorFrom: "from-blue-950",
      colorTo: "to-cyan-900",
      backgroundStyle: "frosted-metal-dark",
    },
    maxHp: 100,
    phases: [
      // ==========================================
      // PHASE 1 — 100% to 75% HP
      // "The First Resistance"
      // ==========================================
      {
        phase: 1,
        title: "The First Resistance",
        description:
          "The combination lock doesn't budge. The cooler seems to sense your presence. Phase 1: find the first two digits of the combination.",
        hpThreshold: 100,
        actions: [
          {
            id: "cooler-p1-clue-check",
            label: "Check the Terrace Inscription",
            description:
              "The terrace carving mentioned a countdown: 5-4-3-2-1-0. The first two digits of the combination are hidden in the countdown itself. Look at it closely.",
            type: "clue_check",
            damage: 25,
            requiredClueId: "clue-terrace-inscription",
            rewardText:
              "The countdown! 5-4-3-2-1-0. The first digit is 5. The second is 4. You enter 54 into the combination. Something clicks. One tumbler yields.",
            failureText:
              "You need the terrace inscription clue first. Go back and complete the Terrace room.",
          },
          {
            id: "cooler-p1-offer-boost",
            label: "Force it with Ritual Strength",
            description:
              "Your team doesn't have the clue yet but is determined. Pay the ritual cost to force partial progress through sheer collective will.",
            type: "offer_boost",
            damage: 15,
            offerCost: 3,
            rewardText:
              "Three Offers paid. The cooler registers your commitment. One tumbler yields slightly — not all the way, but enough. 15 damage dealt.",
          },
        ],
      },
      // ==========================================
      // PHASE 2 — 75% to 50% HP
      // "The Second Tumbler"
      // ==========================================
      {
        phase: 2,
        title: "The Second Tumbler",
        description:
          "One tumbler has yielded. The combination is partly entered. Phase 2: identify the third and fourth digits from the cabin inventory.",
        hpThreshold: 75,
        actions: [
          {
            id: "cooler-p2-clue-check",
            label: "Check the Shed Inventory",
            description:
              "The inventory listed the cooler as Item 7. The next two digits of the combination relate to item numbers. What comes before 7 in the inventory? What comes after?",
            type: "clue_check",
            damage: 25,
            requiredClueId: "clue-shed-inventory",
            rewardText:
              "Item 6 and Item 8. The digits are 6 and 8. You enter 6-8. Another tumbler clicks. Two down, two to go.",
            failureText:
              "You need the shed inventory clue. Complete the Shed room and return.",
          },
          {
            id: "cooler-p2-puzzle",
            label: "Decode the Combination Hint",
            description:
              "On the bottom of the cooler — you have to tilt it slightly to see — someone scratched: \"When the beer count hits zero, the ritual proceeds.\" Zero refers to the countdown. What is zero in the countdown sequence: 5-4-3-2-1-0?",
            type: "puzzle",
            damage: 20,
            puzzle: {
              prompt: "The countdown ends at zero. In the sequence 5-4-3-2-1-0, what number is in position 3 (counting from 1)?",
              answer: ["3", "three"],
            },
            hint: "Position 1 = 5, position 2 = 4, position 3 = ?",
            rewardText: "Position 3 is the number 3. Another tumbler yields. Progress.",
            failureText: "Count again. Starting from the beginning of the countdown.",
          },
          {
            id: "cooler-p2-offer-boost",
            label: "Pay the Cooler's Demand",
            description:
              "The cooler seems to want tribute. It wants Offer. Your team obliges.",
            type: "offer_boost",
            damage: 10,
            offerCost: 4,
            rewardText: "The cooler absorbs your offering. It yields slightly. 10 damage.",
          },
        ],
      },
      // ==========================================
      // PHASE 3 — 50% to 25% HP
      // "The Last Two Digits"
      // ==========================================
      {
        phase: 3,
        title: "The Last Two Digits",
        description:
          "Phase 3: the cooler is rattling. The final two digits require a team decision — and possibly a significant offering.",
        hpThreshold: 50,
        actions: [
          {
            id: "cooler-p3-coaster-code",
            label: "Decode the Coaster Code",
            description:
              "The coaster card from the coffee table — ASKAE. Could the number of letters be a clue? Or the letters themselves map to numbers via the alphabet.",
            type: "clue_check",
            damage: 25,
            requiredClueId: "clue-coffee-table-coaster",
            rewardText:
              "A=1, S=19... wait. A=1, E=5. First and last letters of ASKAE: A(1) and E(5). The final two digits: 1 and 5. You enter 1-5. Three tumblers yield. One left.",
            failureText:
              "You need the coaster code clue. Find it at the Coffee Table room.",
          },
          {
            id: "cooler-p3-social",
            label: "The Group Must Decide",
            description:
              "The cooler demands a group verdict. Every player must agree on the final two digits by social consensus — no puzzle, just collective decision. If the group is wrong, pay the penalty.",
            type: "social",
            damage: 15,
            rewardText:
              "The group reaches consensus. The cooler respects a unified decision. 15 damage.",
            failureText: "The group is divided. The cooler is unmoved. Pay and try again.",
          },
          {
            id: "cooler-p3-offer-boost",
            label: "Overwhelm It With Ritual",
            description: "Brute force through Offer. Expensive, but effective.",
            type: "offer_boost",
            damage: 20,
            offerCost: 5,
            rewardText:
              "Five Offers laid down. The cooler's resistance crumbles under the weight of your dedication. 20 damage. The final tumbler loosens.",
          },
        ],
      },
      // ==========================================
      // PHASE 4 — 25% to 0% HP
      // "The Final Turn"
      // ==========================================
      {
        phase: 4,
        title: "The Final Turn",
        description:
          "All four tumblers are set. Phase 4: the final action. One last effort and the cooler opens. What's inside will determine the path forward.",
        hpThreshold: 25,
        actions: [
          {
            id: "cooler-p4-final-open",
            label: "Turn the Final Dial",
            description:
              "Every digit is entered. The tumblers are aligned. One team member places their hand on the cooler lid. This is the moment.",
            type: "puzzle",
            damage: 25,
            puzzle: {
              prompt:
                "Final verification: what is the full combination you entered, in order? (The four sets of two digits, written together as an 8-digit number.)",
              answer: ["54683415", "5468 3415", "54-68-34-15", "5 4 6 8 3 4 1 5"],
            },
            hint: "Phase 1: 54. Phase 2: 68. Phase 3: 34 or 15. Check your notes.",
            rewardText:
              "CLICK. The lock opens. The cooler lid lifts. Inside: ice. A lot of ice. And nested in the center — two perfectly cold beers, and a sealed envelope labeled \"THE VERDICT.\" Chapter 1 complete.",
            failureText:
              "The digits don't match. Review your clues. The cooler waits.",
          },
          {
            id: "cooler-p4-grand-offering",
            label: "The Grand Offering",
            description:
              "Your team has struggled. The cooler has resisted. End it now with the Grand Offering — pay the maximum tribute and force the lock open through sheer ritual power.",
            type: "offer_boost",
            damage: 30,
            offerCost: 6,
            rewardText:
              "Six Offers. The cooler cannot stand against such commitment. The lock surrenders. The cooler opens. The Grand Offering is complete.",
          },
        ],
      },
    ],
    defeatText:
      "The Locked Cooler is defeated. Inside: two perfectly cold beers and a sealed envelope. Chapter 1 is complete. The team that opened it gets to read the envelope first — and gains the first advantage in Chapter 2.",
    victoryAdvantage:
      "First Access: the winning team gets to unlock their first Chapter 2 room for free.",
  },

  // ==========================================
  // CHAPTER 2 BOSS — The Fake Bottle Opener (stub)
  // ==========================================
  {
    id: "fake-bottle-opener",
    chapterId: "chapter-2",
    title: "The Fake Bottle Opener",
    subtitle: "It opens nothing. That is the point.",
    description: "TODO: Chapter 2 boss content.",
    icon: "🔧",
    look: {
      icon: "🔧",
      atmosphere: "TODO: Chapter 2 boss atmosphere",
      colorFrom: "from-purple-950",
      colorTo: "to-stone-900",
      backgroundStyle: "metal-dark",
    },
    maxHp: 120,
    phases: [],
    defeatText: "TODO: Chapter 2 boss defeat text.",
    victoryAdvantage: "TODO: Chapter 2 victory advantage.",
  },

  // ==========================================
  // CHAPTER 3 / FINAL BOSS — The Opposing Team
  // Each team fights the OTHER team in a head-to-head showdown.
  // Questions are about the opposing team's players — answered live.
  // ==========================================
  {
    id: "last-cold-beer",
    chapterId: "chapter-3",
    title: "The Opposing Team",
    subtitle: "Your final boss has a name. Several, actually.",
    description:
      "The ritual reaches its end. The last cold beer stands in the center of the table. But it cannot be opened by solving a puzzle — it can only be opened by defeating the opposing team in a direct showdown. Questions about them. Challenges against them. One team opens the beer. One team watches.",
    icon: "⚔️",
    look: {
      icon: "⚔️",
      atmosphere:
        "The two teams face each other. The beer is in the center. Someone is going to open it — but only after the other team has been tested, questioned, and humbled. The ritual demands a verdict.",
      colorFrom: "from-red-950",
      colorTo: "to-amber-900",
      backgroundStyle: "battle-ground",
    },
    maxHp: 150,
    phases: [
      {
        phase: 1,
        title: "The Interrogation",
        description:
          "Phase 1: Your team asks the opposing team three questions about themselves. Each correct answer by the opposing team counts as resistance. Each wrong answer deals damage to their boss HP.",
        hpThreshold: 100,
        actions: [
          {
            id: "final-p1-trivia",
            label: "Ask the Trivia Round",
            description:
              "Your team asks the opposing team: what was the most embarrassing thing that happened on a previous cabin trip? The opposing team must answer. If the full group agrees the answer is genuine and specific, the boss takes full damage. If it's vague or dodged, pay the toll.",
            type: "social",
            damage: 30,
            rewardText: "The opposing team answered. The ritual registers it. 30 damage dealt.",
            failureText: "The opposing team dodged the question. The boss is unmoved.",
          },
          {
            id: "final-p1-offer-boost",
            label: "Press the Attack",
            description: "Your team pays the ritual cost to press harder. No mercy.",
            type: "offer_boost",
            damage: 20,
            offerCost: 3,
            rewardText: "The pressure works. 20 damage dealt.",
          },
        ],
      },
      {
        phase: 2,
        title: "The Challenge Round",
        description:
          "Phase 2: Direct challenges. Your team issues physical or social challenges to the opposing team. The host judges.",
        hpThreshold: 66,
        actions: [
          {
            id: "final-p2-challenge",
            label: "Issue a Cabin Challenge",
            description:
              "Your team issues a challenge to the opposing team — a physical feat, a performance, or a truth. The opposing team must attempt it. The host and full group vote on success. Success = full damage. Fail = half damage.",
            type: "social",
            damage: 35,
            rewardText: "Challenge accepted and executed. The beer shifts toward your team. 35 damage.",
            failureText: "They attempted it. Not quite. Half credit.",
          },
          {
            id: "final-p2-offer-boost",
            label: "Double Down",
            description: "Pay the cost to deal bonus damage regardless of the outcome.",
            type: "offer_boost",
            damage: 15,
            offerCost: 4,
            rewardText: "You paid to press harder. 15 extra damage.",
          },
        ],
      },
      {
        phase: 3,
        title: "The Final Verdict",
        description:
          "Phase 3: The ritual demands a final verdict. One person from the opposing team must be named as the one who was most responsible for this weekend — for good or ill. The group votes.",
        hpThreshold: 33,
        actions: [
          {
            id: "final-p3-verdict",
            label: "Deliver the Verdict",
            description:
              "Name one person from the opposing team as the MVP of this ritual weekend. Give a reason. The group applauds or boos. Majority rules. Deliver the verdict and the boss falls.",
            type: "social",
            damage: 50,
            rewardText:
              "The verdict is delivered. The opposing team has been named, judged, and honored. The last cold beer can now be opened. The ritual is complete.",
            failureText: "The group is divided. Try again — someone must be named.",
          },
          {
            id: "final-p3-grand-offering",
            label: "The Grand Offering",
            description: "Skip the verdict. End it with maximum ritual power.",
            type: "offer_boost",
            damage: 60,
            offerCost: 8,
            rewardText: "Eight Offers. The ritual acknowledges your sacrifice. The boss falls. The beer is yours.",
          },
        ],
      },
    ],
    defeatText:
      "The opposing team has been defeated — questioned, challenged, and judged. The last cold beer belongs to your team. Open it together. The ritual is complete.",
    victoryAdvantage: "The winning team opens the Last Cold Beer. One can. One team. The ritual ends here.",
  },
];

export function getBoss(id: string): Boss | undefined {
  return BOSSES.find((b) => b.id === id);
}

export function getBossByChapter(chapterId: string): Boss | undefined {
  return BOSSES.find((b) => b.chapterId === chapterId);
}
