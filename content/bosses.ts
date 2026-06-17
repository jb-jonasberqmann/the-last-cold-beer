import type { Boss } from "@/types/content";

export const BOSSES: Boss[] = [
  // ==========================================
  // CHAPTER 1 BOSS — The Locked Cooler
  // 4 phases, 100 HP
  // Combination: 546815 (three 2-digit pairs)
  //   Phase 1 → 54 (terrace countdown: first two numbers)
  //   Phase 2 → 68 (shed inventory: items flanking item 7)
  //   Phase 3 → 15 (coaster code ASKAE: A=1, E=5)
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
      // ==========================================
      // PHASE 1 — 100% to 75% HP
      // "The First Resistance"
      // ==========================================
      {
        phase: 1,
        title: "The First Resistance",
        description:
          "The combination lock doesn't budge. The cooler seems to sense your presence. Phase 1: find the first two digits of the combination. A clue was carved into the terrace railing.",
        hpThreshold: 100,
        actions: [
          {
            id: "cooler-p1-clue-check",
            label: "Apply the Terrace Inscription",
            description:
              "The terrace railing held a carved countdown sequence. Study it carefully — the combination begins somewhere in that sequence.",
            type: "clue_check",
            damage: 25,
            requiredClueId: "clue-terrace-inscription",
            rewardText:
              "You study the countdown: 5-4-3-2-1-0. The ritual begins at the top. The first tumbler accepts your answer. Something clicks inside the lock.",
            failureText:
              "You need the terrace inscription clue first. Go back and complete the Terrace room.",
          },
          {
            id: "cooler-p1-puzzle",
            label: "Decode the First Digits",
            description:
              "On the lid of the cooler, almost too faint to read: \"The ritual opens where the countdown begins.\" The terrace held a carved countdown sequence. Where does it begin?",
            type: "puzzle",
            damage: 20,
            puzzle: {
              prompt: "The terrace countdown is a sequence of numbers from high to low, ending at zero. What are the first two numbers of that sequence, written as a single two-digit number?",
              answer: ["54", "5 4", "five four"],
            },
            hint: "The countdown begins at the highest point and descends. Think about the first two steps down.",
            rewardText:
              "The first tumbler yields with a click. One step closer.",
            failureText:
              "The lock is unimpressed. Study the countdown again from the beginning.",
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
          "One tumbler has yielded. The combination is partly entered. Phase 2: the next two digits are hidden in the shed's inventory. The cooler is item 7 — think about what surrounds it.",
        hpThreshold: 75,
        actions: [
          {
            id: "cooler-p2-clue-check",
            label: "Apply the Shed Inventory",
            description:
              "The inventory listed every item in this cabin. The cooler is item 7. The combination digits are hiding among its neighbors on that list.",
            type: "clue_check",
            damage: 25,
            requiredClueId: "clue-shed-inventory",
            rewardText:
              "The items immediately surrounding the cooler on the inventory — their numbers together form the next digits. Another tumbler clicks. Two down.",
            failureText:
              "You need the shed inventory clue. Complete the Shed room and return.",
          },
          {
            id: "cooler-p2-puzzle",
            label: "Read the Lock Plate",
            description:
              "On the lock casing, etched into the metal on either side of the dial, are two Roman numerals: one to the left, one to the right. They flank the dial the way certain items flank the cooler on a list. What two-digit number do those Roman numerals represent, read left to right?",
            type: "puzzle",
            damage: 20,
            puzzle: {
              prompt: "The Roman numeral to the left of the dial is VI. The Roman numeral to the right is VIII. Write both as standard digits, side by side, as a single two-digit number.",
              answer: ["68", "6 8", "six eight"],
            },
            hint: "VI = 6. VIII = 8. Read them together.",
            rewardText: "68. The second tumbler yields. Progress measured in clicks.",
            failureText: "Convert each Roman numeral to its Arabic digit, then place them side by side.",
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
          "Phase 3: the cooler is rattling. The final two digits come from the coaster card — a five-letter code hidden under the coffee table. The alphabet holds the key.",
        hpThreshold: 50,
        actions: [
          {
            id: "cooler-p3-coaster-code",
            label: "Decode the Coaster Code",
            description:
              "The coaster card bears a five-letter code. The alphabet assigns a number to each letter. Look at the first and last letters of that code — their positions in the alphabet form the final two digits.",
            type: "clue_check",
            damage: 25,
            requiredClueId: "clue-coffee-table-coaster",
            rewardText:
              "The first and last letters of the code, converted by their position in the alphabet: two single digits side by side. The third tumbler yields. Almost there.",
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
          "All three tumblers are set. Phase 4: verify the complete combination — three pairs of two digits, written together as a six-digit number. Enter it correctly and the cooler opens.",
        hpThreshold: 25,
        actions: [
          {
            id: "cooler-p4-final-open",
            label: "Turn the Final Dial",
            description:
              "Every digit is entered. The tumblers are aligned. One team member places their hand on the cooler lid. This is the moment. Enter the full six-digit combination to open it.",
            type: "puzzle",
            damage: 25,
            puzzle: {
              prompt:
                "What is the complete six-digit combination you have assembled across the three phases? Write it as a continuous number.",
              answer: ["546815", "54 68 15", "54-68-15", "5 4 6 8 1 5"],
            },
            hint: "Three phases, three clues, three pairs of digits. Review your case file.",
            rewardText:
              "CLICK. The lock opens. The cooler lid lifts. Inside: ice. A lot of ice. And nested in the center — two perfectly cold beers, and a sealed envelope labeled \"THE VERDICT.\" Chapter 1 complete.",
            failureText:
              "The digits don't match. Review your clues from each phase. The cooler waits.",
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
          title: "Den Første Modstand",
          description:
            "Kombinationslåsen giver ikke efter. Køleren synes at mærke jeres tilstedeværelse. Fase 1: find de første to cifre i kombinationen. Et spor var ridset ind i terrasse-gelænderet.",
          actions: [
            {
              id: "cooler-p1-clue-check",
              label: "Anvend Terrasse-Ristningen",
              description:
                "Terrassens gelænder havde en ristet nedtællingssekvens. Studér den omhyggeligt — kombinationen begynder et sted i den sekvens.",
              rewardText:
                "Du studerer nedtællingen: 5-4-3-2-1-0. Ritualet begynder øverst. Den første tromle accepterer dit svar. Noget klikker inde i låsen.",
              failureText:
                "Du har brug for terrasse-ristnings-sporet. Gå tilbage og fuldfør Terrasse-rummet.",
            },
            {
              id: "cooler-p1-puzzle",
              label: "Afkod De Første Cifre",
              description:
                "På lågets overflade, næsten for svagt at læse: \"Ritualet åbner hvor nedtællingen begynder.\" Terrassen havde en ristet nedtællingssekvens. Hvor begynder den?",
              puzzlePrompt: "Terrasse-nedtællingen er en sekvens af tal fra høj til lav, der slutter ved nul. Hvad er de første to tal i den sekvens, skrevet som et enkelt tocifret tal?",
              hint: "Nedtællingen begynder på det højeste punkt og falder. Tænk på de første to trin ned.",
              rewardText: "Den første tromle giver efter med et klik. Et skridt nærmere.",
              failureText: "Låsen er imponeret. Studér nedtællingen igen fra begyndelsen.",
            },
            {
              id: "cooler-p1-offer-boost",
              label: "Tving Den Med Ritualstyrke",
              description:
                "Jeres hold har ikke sporet endnu, men er fast besluttet. Betal ritualomkostningen for at tvinge delvis fremgang igennem med ren kollektiv vilje.",
              rewardText:
                "Tre Offers betalt. Køleren registrerer jeres engagement. En tromle giver en smule efter — ikke helt, men nok. 15 skade tilføjet.",
            },
          ],
        },
        {
          phase: 2,
          title: "Den Anden Tromle",
          description:
            "Én tromle har givet efter. Kombinationen er delvist indtastet. Fase 2: de næste to cifre er gemt i skurets inventar. Køleren er genstand 7 — tænk på hvad der omgiver den.",
          actions: [
            {
              id: "cooler-p2-clue-check",
              label: "Anvend Skurets Inventar",
              description:
                "Inventaret listede alle genstande i denne hytte. Køleren er genstand 7. Kombinationscifre gemmer sig blandt dens naboer på den liste.",
              rewardText:
                "Genstandene der umiddelbart omgiver køleren på inventaret — deres numre danner tilsammen de næste cifre. Endnu en tromle klikker. To ned.",
              failureText:
                "Du har brug for skurets inventar-spor. Fuldfør Skur-rummet og vend tilbage.",
            },
            {
              id: "cooler-p2-puzzle",
              label: "Læs Låsepladen",
              description:
                "På låsehuset, ridset ind i metallet på hver side af skiven, er to romertal: et til venstre, et til højre. De flankerer skiven ligesom visse genstande flankerer køleren på en liste. Hvilket tocifret tal repræsenterer disse romertal, læst fra venstre mod højre?",
              puzzlePrompt: "Romertal til venstre for skiven er VI. Romertal til højre er VIII. Skriv begge som standardcifre, side om side, som et enkelt tocifret tal.",
              hint: "VI = 6. VIII = 8. Læs dem sammen.",
              rewardText: "68. Den anden tromle giver efter. Fremgang målt i klik.",
              failureText: "Konvertér hvert romertal til dets arabiske ciffer, og placér dem derefter side om side.",
            },
            {
              id: "cooler-p2-offer-boost",
              label: "Betal Kølerens Krav",
              description: "Køleren synes at ville have tribut. Den vil have Offer. Jeres hold efterkommer det.",
              rewardText: "Køleren absorberer jeres offergave. Den giver en smule efter. 10 skade.",
            },
          ],
        },
        {
          phase: 3,
          title: "De Sidste To Cifre",
          description:
            "Fase 3: køleren ryster. De sidste to cifre kommer fra brikkortet — en fembogstavskode gemt under sofabordet. Alfabetet holder nøglen.",
          actions: [
            {
              id: "cooler-p3-coaster-code",
              label: "Afkod Brikkekoden",
              description:
                "Brikkortet bærer en fembogstavskode. Alfabetet tildeler et tal til hvert bogstav. Se på første og sidste bogstav i den kode — deres placering i alfabetet danner de sidste to cifre.",
              rewardText:
                "Det første og sidste bogstav i koden, konverteret via deres placering i alfabetet: to enkeltcifre side om side. Den tredje tromle giver efter. Næsten der.",
              failureText:
                "Du har brug for brikkekode-sporet. Find det i Sofabord-rummet.",
            },
            {
              id: "cooler-p3-social",
              label: "Gruppen Skal Beslutte",
              description:
                "Køleren kræver en gruppekendelse. Alle spillere skal blive enige om de sidste to cifre via social konsensus — ingen gåde, blot kollektiv beslutning. Betaler gruppen hvis de tager fejl.",
              rewardText: "Gruppen når konsensus. Køleren respekterer en samlet beslutning. 15 skade.",
              failureText: "Gruppen er splitted. Køleren er uberørt. Betal og prøv igen.",
            },
            {
              id: "cooler-p3-offer-boost",
              label: "Overmand Den Med Ritual",
              description: "Brutal kraft via Offer. Dyrt, men effektivt.",
              rewardText: "Fem Offers lagt ned. Kølerens modstand smuldrer under vægten af jeres dedikation. 20 skade. Den sidste tromle løsner.",
            },
          ],
        },
        {
          phase: 4,
          title: "Det Endelige Drej",
          description:
            "Alle tre tromler er sat. Fase 4: bekræft den komplette kombination — tre par af to cifre, skrevet sammen som et sescifret tal. Indtast det korrekt og køleren åbner.",
          actions: [
            {
              id: "cooler-p4-final-open",
              label: "Drej Den Endelige Skive",
              description:
                "Hvert ciffer er indtastet. Tromlerne er justeret. Ét holdmedlem lægger hånden på kølerens låg. Dette er øjeblikket. Indtast den fulde sekscifrede kombination for at åbne den.",
              puzzlePrompt:
                "Hvad er den komplette sekscifrede kombination du har samlet på tværs af de tre faser? Skriv den som et sammenhængende tal.",
              hint: "Tre faser, tre spor, tre par cifre. Gennemse din sagsmapp.",
              rewardText:
                "KLIK. Låsen åbner. Kølerens låg løftes. Indeni: is. Meget is. Og gemt i midten — to perfekt kolde øl, og en forseglet konvolut mærket \"KENDELSEN.\" Kapitel 1 fuldført.",
              failureText:
                "Cifrene stemmer ikke. Gennemse dine spor fra hver fase. Køleren venter.",
            },
            {
              id: "cooler-p4-grand-offering",
              label: "Den Store Offergave",
              description:
                "Jeres hold har kæmpet. Køleren har modstået. Afslut det nu med Den Store Offergave — betal det maksimale tribut og tving låsen op med ren ritualstyrke.",
              rewardText:
                "Seks Offers. Køleren kan ikke modstå et sådant engagement. Låsen kapitulerer. Køleren åbner. Den Store Offergave er fuldført.",
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
