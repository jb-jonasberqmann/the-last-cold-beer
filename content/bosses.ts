import type { Boss } from "@/types/content";

export const BOSSES: Boss[] = [
  // ==========================================
  // CHAPTER 1 BOSS — The Locked Cooler
  // 1 phase, 100 HP
  // Team A combination: 67 (countdown start 6, inventory item 7, ordered)
  // Team B combination: 04:08 (railing carvers 4, valid inventory 8, as time)
  // Both teams fight the same cooler independently.
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
    requiredRoomIds: ["shed"],
    phases: [
      {
        phase: 1,
        title: "The Lock",
        description:
          "The combination lock doesn't budge. Your team has gathered clues across the cabin. Now use them. Apply what you found — or pay the tribute.",
        hpThreshold: 100,
        actions: [
          // ——— Team A: First Tumbler ———
          {
            id: "cooler-clue-check-team-a",
            label: "Apply the Order Rule (Team A)",
            description:
              "The shed warned your team not to add or multiply — to use order instead. You have two numbers from the cabin: the countdown started at 6, and the locked cooler is Item 7. Place them in order.",
            type: "clue_check",
            damage: 20,
            requiredClueId: "clue-shed-order-rule",
            rewardText:
              "The order rule clicks into place. The clues align: 6 first, then 7. Something shifts inside the lock.",
            failureText:
              "You need the Order Rule clue from the Shed first. Go back and find it.",
          },
          {
            id: "cooler-puzzle-team-a",
            label: "Enter the Combination (Team A)",
            description:
              "Your team found:\n— The terrace countdown began at 6\n— The damaged inventory line placed the cooler at item 7\n— The shed warned you to use order, not math\n\nPlace the two numbers in sequence. What two digits open the lock?",
            type: "puzzle",
            damage: 40,
            puzzle: {
              prompt:
                "The lock is asking for a sequence, not a calculation.\nUse the clue about what came first, then what held it.\nEnter the two digits in order.",
              answer: ["67", "6 7", "six seven"],
            },
            hint: "First lost, then locked. The countdown tells you what came first. The inventory tells you what held it.",
            rewardText:
              "CLICK. The lock responds. The cooler takes serious damage. Your team is close.",
            failureText:
              "The lock is unimpressed. Think about what you found first — and what you found it locked inside.",
          },

          // ——— Team B: Receipt Tumbler ———
          {
            id: "cooler-clue-check-team-b",
            label: "Apply the Time Format (Team B)",
            description:
              "The torn receipt in the shed showed a damaged timestamp — only the colon remained. The note said: \"The hour came from the railing. The minutes came from the list.\" Your team has both numbers.",
            type: "clue_check",
            damage: 20,
            requiredClueId: "clue-shed-torn-timestamp",
            rewardText:
              "The time format clicks. The receipt clue is confirmed. Your numbers slot into hours and minutes.",
            failureText:
              "You need the Torn Timestamp clue from the Shed first. Go back and find it.",
          },
          {
            id: "cooler-puzzle-team-b",
            label: "Enter the Combination (Team B)",
            description:
              "Your team found:\n— The terrace railing was carved by 4 different people (the hour)\n— The valid inventory count was 8 (the minutes)\n— The torn receipt told you to format it as a time\n\nWhat time opens the receipt lock?",
            type: "puzzle",
            damage: 40,
            puzzle: {
              prompt:
                "Use the two numbers as parts of a clock, not as one normal number.\nA single-digit hour often needs help standing in the hour slot.\nEnter the time.",
              answer: ["04:08", "4:08", "0408", "408", "04.08", "4.08"],
            },
            hint: "Railing gives the hour (4 carvers). Inventory gives the minutes (8 valid items). Format: HH:MM.",
            rewardText:
              "CLICK. The frozen receipt timestamp is confirmed. The cooler shudders. Major damage dealt.",
            failureText:
              "The lock rejects it. Check the format — does the hour need a leading zero?",
          },

          // ——— Shared: Offer boosts ———
          {
            id: "cooler-offer-boost",
            label: "Force it with Ritual Strength",
            description:
              "Your team doesn't have all the clues yet but is determined. Pay the ritual cost to force partial progress through sheer collective will.",
            type: "offer_boost",
            damage: 15,
            offerCost: 3,
            rewardText:
              "Three Offers paid. The cooler registers your commitment. Something yields slightly. 15 damage dealt.",
          },
          {
            id: "cooler-grand-offering",
            label: "The Grand Offering",
            description:
              "Your team has struggled. The cooler has resisted. End it now with the Grand Offering — pay the maximum tribute and force the lock open through sheer ritual power.",
            type: "offer_boost",
            damage: 35,
            offerCost: 7,
            rewardText:
              "Seven Offers. The cooler cannot stand against such commitment. The lock surrenders. The Grand Offering is complete.",
          },
        ],
      },
    ],
    defeatText:
      "The Locked Cooler is defeated. Inside: two perfectly cold beers and a sealed envelope. Chapter 1 is complete. The team that opened it gets to read the envelope first — and gains the first advantage in Chapter 2.",
    victoryAdvantage:
      "First Access: the winning team gets to unlock their first Chapter 2 room for free.",
    da: {
      title: "Den Låste Køler",
      subtitle: "Den har ventet på dette øjeblik.",
      description:
        "Bag skuret — eller måske var den der altid — sidder en stor køler med en kombinationslås. Låsen er gammel. Køleren summer svagt, hvilket er mistænkeligt fordi den ikke er tilsluttet. Kombinationen gemmer sig et sted i de spor jeres hold har samlet. Forhåbentlig.",
      atmosphere:
        "Køleren sidder i det dæmpede lys fra baglokalet. Kombinationslåsens skive har slidte tal. Den bevæger sig ikke når du forsøger at åbne den. Noget inde i den skifter — forsigtigt, bevidst.",
      defeatText:
        "Den Låste Køler er besejret. Indeni: to perfekt kolde øl og en forseglet konvolut. Kapitel 1 er fuldført. Det hold der åbnede den må læse konvolutten først — og får den første fordel i Kapitel 2.",
      victoryAdvantage:
        "Første adgang: det vindende hold må låse deres første Kapitel 2-rum op gratis.",
      phases: [
        {
          phase: 1,
          title: "Låsen",
          description:
            "Kombinationslåsen giver ikke efter. Jeres hold har samlet spor gennem hele hytten. Brug dem nu. Anvend hvad I fandt — eller betal tribut.",
          actions: [
            {
              id: "cooler-clue-check-team-a",
              label: "Anvend Ordensreglen (Hold A)",
              description:
                "Skuret advarede jeres hold om ikke at addere eller multiplicere — men om at bruge rækkefølge. I har to tal fra hytten: nedtællingen startede ved 6, og den låste køler er Genstand 7. Placer dem i rækkefølge.",
              rewardText:
                "Ordensreglen klikker på plads. Sporene flugter: 6 først, derefter 7. Noget bevæger sig inde i låsen.",
              failureText:
                "Du har brug for Ordensregels-sporet fra Skuret først. Gå tilbage og find det.",
            },
            {
              id: "cooler-puzzle-team-a",
              label: "Indtast Kombinationen (Hold A)",
              description:
                "Jeres hold fandt:\n— Terrasse-nedtællingen begyndte ved 6\n— Den beskadigede inventarlinje placerede køleren ved genstand 7\n— Skuret advarede jer om at bruge rækkefølge, ikke matematik\n\nPlacer de to tal i rækkefølge. Hvilke to cifre åbner låsen?",
              puzzlePrompt:
                "Låsen beder om en sekvens, ikke en beregning.\nBrug sporet om hvad kom først, derefter hvad der holdt det.\nIndtast de to cifre i rækkefølge.",
              hint: "Først tabt, derefter låst. Nedtællingen fortæller hvad der kom først. Inventaret fortæller hvad der holdt det.",
              rewardText:
                "KLIK. Låsen reagerer. Køleren tager alvorlig skade. Jeres hold er tæt på.",
              failureText:
                "Låsen er uimponeret. Tænk på hvad I fandt først — og hvad I fandt det låst inde i.",
            },
            {
              id: "cooler-clue-check-team-b",
              label: "Anvend Tidsformatet (Hold B)",
              description:
                "Den iturevne kvittering i skuret viste et beskadiget tidsstempel — kun kolonen var tilbage. Noten sagde: \"Timen kom fra gelænderet. Minutterne kom fra listen.\" Jeres hold har begge tal.",
              rewardText:
                "Tidsformatet klikker. Kvitteringssporet er bekræftet. Jeres tal passer ind som timer og minutter.",
              failureText:
                "Du har brug for Iturevet Tidsstempel-sporet fra Skuret først. Gå tilbage og find det.",
            },
            {
              id: "cooler-puzzle-team-b",
              label: "Indtast Kombinationen (Hold B)",
              description:
                "Jeres hold fandt:\n— Terrasse-gelænderet var ridset af 4 forskellige personer (timen)\n— Det gyldige inventarantal var 8 (minutterne)\n— Den iturevne kvittering fortalte jer at formatere det som et klokkeslæt\n\nHvilket klokkeslæt åbner kvitteringslåsen?",
              puzzlePrompt:
                "Brug de to tal som dele af et ur, ikke som et normalt tal.\nEt enkeltcifret antal timer har ofte brug for hjælp i timefeltet.\nIndtast klokkeslættet.",
              hint: "Gelænderet giver timen (4 ristere). Inventaret giver minutterne (8 gyldige). Format: TT:MM.",
              rewardText:
                "KLIK. Det frosne kvitteringstidsstempel er bekræftet. Køleren skælver. Stor skade tilføjet.",
              failureText:
                "Låsen afviser det. Tjek formatet — skal timen have et foranstillet nul?",
            },
            {
              id: "cooler-offer-boost",
              label: "Tving Den Med Ritualstyrke",
              description:
                "Jeres hold har ikke alle sporene endnu, men er fast besluttet. Betal ritualomkostningen for at tvinge delvis fremgang igennem med ren kollektiv vilje.",
              rewardText:
                "Tre Offers betalt. Køleren registrerer jeres engagement. Noget giver en smule efter. 15 skade tilføjet.",
            },
            {
              id: "cooler-grand-offering",
              label: "Den Store Offergave",
              description:
                "Jeres hold har kæmpet. Køleren har modstået. Afslut det nu med Den Store Offergave — betal det maksimale tribut og tving låsen op med ren ritualstyrke.",
              rewardText:
                "Syv Offers. Køleren kan ikke modstå et sådant engagement. Låsen kapitulerer. Den Store Offergave er fuldført.",
            },
          ],
        },
      ],
    },
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
