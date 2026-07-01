import type { Boss } from "@/types/content";

export const BOSSES: Boss[] = [

  // ==========================================
  // ACT 1 BOSS — MADS
  // Not a monster. A friend. Late, chaotic, arms full.
  // HP label: "Unpacking"
  // ==========================================
  {
    id: "mads",
    chapterId: "act-1",
    title: "The Keybearer",
    subtitle: "Late. Unapologetic. Arms completely full.",
    description:
      "Mads arrives just as you're heading to the front door. Arms completely full — a cooler, a sleeping bag, two cases of beer, something wrapped in a garbage bag. He grins. He does not apologize. His phone was on silent. He had the code the whole time. He won't give it to you until his arms are empty.",
    icon: "🙋",
    look: {
      icon: "🙋",
      atmosphere:
        "Mads's car is blocking the path. The boot is open. Bags, towels, loose items — he needs help unloading. The code fragment is somewhere in that jacket. You cannot get to it while his arms are full.",
      colorFrom: "from-amber-800",
      colorTo: "to-stone-900",
      backgroundStyle: "outdoor-carport",
    },
    maxHp: 100,
    requiredRoomIds: ["shed"],
    counterAttacks: [
      {
        id: "defend",
        label: "Defensive Shuffle",
        description: "Mads pivots sideways and blocks the path with the cooler. Your next move only deals 75% damage.",
        weight: 3,
        effect: { type: "defend", defenseMultiplier: 0.75 },
      },
      {
        id: "attack",
        label: "Surprise Bag",
        description: "\"Oh — there's one more bag in the back.\" Mads hands it straight at you. Team drinks 1 sip.",
        weight: 3,
        effect: { type: "attack", teamOfferDamage: 1 },
      },
      {
        id: "heal",
        label: "Hidden Case",
        description: "\"Wait — I forgot. There's a full case of beer under the sleeping bag.\" Mads perks up visibly. He heals 20% HP.",
        weight: 1,
        effect: { type: "heal", healPercent: 0.20, isOnce: true },
      },
    ],
    phases: [
      {
        phase: 1,
        title: "The Unloading",
        description:
          "Mads cannot give you the code while his arms are full. Help him get everything inside. Each action can only be done once — and Mads always has a response.",
        hpThreshold: 100,
        actions: [
          {
            id: "mads-cooler",
            label: "Carry the heavy cooler",
            description:
              "The cooler is enormous. Someone needs to grab the other handle. It goes in the utility corner.",
            type: "social",
            damage: 12,
            rewardText:
              "The cooler makes it inside. Mads's arms are slightly less full.",
            failureText: "It's too heavy for one person. Try again together.",
          },
          {
            id: "mads-beer",
            label: "Grab the beer cases",
            description:
              "Two cases of beer in the boot. Someone takes one, someone takes the other. Both get carried in.",
            type: "social",
            damage: 10,
            rewardText: "Beer inside. One fewer thing Mads is carrying.",
            failureText: "Leave no beer behind.",
          },
          {
            id: "mads-door",
            label: "Hold the door open",
            description:
              "The sleeping bag is awkward under his arm. Someone holds the door, someone guides him through the frame.",
            type: "social",
            damage: 8,
            rewardText: "Sleeping bag inside. Mads made it through the door.",
          },
          {
            id: "mads-phone",
            label: "Find his phone",
            description:
              "His phone is somewhere in the car. The last code fragment is in his notes app — but you need the phone first.",
            type: "puzzle",
            damage: 22,
            puzzle: {
              prompt:
                "Mads checks every pocket. Jacket — empty. Jeans — empty. Car seat — nothing. Then he looks at you. \"Check the sun visor,\" he says. \"I always put it there and always forget.\" What do you find?",
              answer: ["phone", "his phone", "the phone", "telefon", "mobil", "mobilen"],
            },
            hint: "He just told you where he put it.",
            rewardText:
              "The phone. In the sun visor. He had it the whole time. Mads pulls up his notes app — the last code fragment is right there.",
            failureText: "The car is messier than it looks. Try again.",
          },
          {
            id: "mads-offer-boost",
            label: "Bribe Mads",
            description: "Pay the ritual cost and he stops dragging his feet. One-time only — he won't be bought twice.",
            type: "offer_boost",
            damage: 25,
            offerCost: 2,
            rewardText: "Mads grins. Moves a little faster. 25 unpacking progress.",
          },
        ],
      },
    ],
    defeatText:
      "Mads is finally empty-handed. He grins. He pulls out his phone and opens his notes app. \"This is it,\" he says, turning the screen to face you. The last code fragment. Now combine all five and try the front door.",
    victoryAdvantage:
      "Final fragment: Mads gives your team the last piece of the key box code. Head to the front door.",
    da: {
      title: "The Keybearer",
      subtitle: "Forsinket. Uundskyldende. Armene fuldstændig fulde.",
      description:
        "Mads kører ind på carporten, døren åben inden motoren er slukket. Han bærer mere end det er fysisk rimeligt — en køler, en sovepose, to kasser øl, noget pakket ind i en skraldpose. Han griner. Han undskyldes ikke. Hans telefon var på lydløs. Han havde koden hele tiden.",
      atmosphere:
        "Carporten. Mads' bil er skæv i parkeringspladsen. Bagagerummet er åbent. Indersiden af bilen er et kaos af tasker, håndklæder og løse genstande.",
      defeatText:
        "Mads er endelig tomhændet. Han griner. Han trækker sin telefon op og åbner sin noter-app. \"Det er det,\" siger han og vender skærmen mod jer. Det sidste kodefragment.",
      victoryAdvantage:
        "Sidste fragment: Mads giver jeres hold det sidste stykke af nøgleboks-koden.",
      phases: [
        {
          phase: 1,
          title: "Losningen",
          description: "Mads kan ikke give jer koden mens hans arme er fulde. Hjælp ham med at få alt ind.",
          actions: [
            { id: "mads-cooler", label: "Bær den tunge køler", rewardText: "Køleren er inde. Mads' arme er lidt mere fri.", failureText: "Den er for tung til én person." },
            { id: "mads-beer", label: "Tag ølkasserne", rewardText: "Øl inde. Én ting færre Mads bærer." },
            { id: "mads-door", label: "Hold døren åben", rewardText: "Sovepose inde. Mads kom igennem døren." },
            { id: "mads-phone", label: "Find hans telefon", puzzlePrompt: "Mads tjekker hver lomme. Jakke — tom. Jeans — tom. Bilsæde — intet. Så ser han på jer. \"Tjek solskærmen,\" siger han. \"Jeg lægger den altid der og glemmer det altid.\" Hvad finder du?", hint: "Han fortalte dig netop hvor han lagde den.", rewardText: "Telefonen. I solskærmen. Det sidste kodefragment er lige der.", failureText: "Bilen er mere rodet end den ser ud." },
            { id: "mads-offer-boost", label: "Bestik Mads", rewardText: "Mads griner. Bevæger sig lidt hurtigere. 25 fremskridt." },
          ],
        },
      ],
    },
  },

  // ==========================================
  // ACT 2 BOSS — THE RADIO
  // HP label: "Signal Strength"
  // Defeat is cinematic — triggers Act 2→3 transition
  // ==========================================
  {
    id: "the-radio",
    chapterId: "act-2",
    title: "The Radio",
    subtitle: "Old bakelite. Green dial. It has been trying to tell you something all evening.",
    description:
      "The old brown bakelite radio in the dining room. It has been crackling since you arrived. A green tuner dial. A fraying antenna. You've collected fragments of what it's been saying all evening — across the living room, the kitchen, the activity room. Now it's time to fix it and hear the broadcast clearly.",
    icon: "📻",
    look: {
      icon: "📻",
      atmosphere:
        "The dining room, evening. The long pine table, eight chairs, candles burning. On the shelf: the radio. The green dial glows faintly. The static is low but constant. The sound fills the room in a way that makes it hard to tell if it's coming from inside or outside your head.",
      colorFrom: "from-amber-950",
      colorTo: "to-stone-900",
      backgroundStyle: "warm-dining-radio",
    },
    maxHp: 120,
    requiredRoomIds: ["living-room", "kitchen-act2", "activity-room"],
    phases: [
      {
        phase: 1,
        title: "Static",
        description: "The signal is barely there. You have all three fragments. Start restoring.",
        hpThreshold: 100,
        actions: [
          {
            id: "radio-antenna",
            label: "Adjust the antenna",
            description:
              "The antenna is bent at a wrong angle — not broken, just wrong. Someone has been at it. Straighten it. Try different positions. The static changes pitch when you're close.",
            type: "social",
            damage: 25,
            rewardText:
              "The antenna finds a position. The static thins slightly. Signal strength climbing. 25 HP restored.",
            failureText: "The static is unchanged. Try a different angle.",
          },
          {
            id: "radio-fuse",
            label: "Replace the fuse",
            description:
              "Behind the back panel — a small compartment. Inside: a blown fuse. There's a spare taped to the inside of the panel door. Someone knew this would happen.",
            type: "puzzle",
            damage: 30,
            puzzle: {
              prompt:
                "The replacement fuse is taped to the inside of the panel door. A note beside it, in handwriting you don't recognise: \"Not the first time. Won't be the last. Match the rating exactly.\" The blown fuse reads: 250mA. The spare reads: 250mA. What do you do?",
              answer: ["replace", "swap", "install", "put it in", "use the spare", "erstat", "sæt den i"],
            },
            hint: "The note says to match the rating exactly. Both fuses match. The answer is obvious.",
            rewardText:
              "The fuse is replaced. The green dial brightens — visibly. Something is waking up in there. 30 HP restored.",
            failureText: "The panel closes. The static continues. Think about what the note said.",
          },
          {
            id: "radio-frequency",
            label: "Tune the frequency",
            description:
              "The dial clicks in small increments. You have three fragments of the broadcast from across the house. Try to find the frequency where all three resolve into one sentence.",
            type: "clue_check",
            damage: 35,
            requiredClueId: "radio-fragment-activity",
            rewardText:
              "The dial locks in. The green light blazes. Signal strength at maximum. One more action and the broadcast will be clear.",
            failureText:
              "You need all three radio fragments first — from the living room, the kitchen, and the activity room.",
          },
          {
            id: "radio-offer-boost",
            label: "Pour one out for the radio",
            description: "Pay the ritual cost. The radio responds to sincerity.",
            type: "offer_boost",
            damage: 20,
            offerCost: 2,
            rewardText: "The static softens. 20 HP restored.",
          },
        ],
      },
      {
        phase: 2,
        title: "Signal Locked",
        description: "The signal is almost clear. One final action and the radio will broadcast.",
        hpThreshold: 40,
        actions: [
          {
            id: "radio-speaker",
            label: "Clean the speaker grille",
            description:
              "The grille is dusty — years of it. A cloth, a gentle hand. The sound needs somewhere to go.",
            type: "social",
            damage: 40,
            rewardText:
              "The grille is clear. The radio is ready. Complete the signal.",
            failureText: "The grille resists. Try harder.",
          },
          {
            id: "radio-wire",
            label: "Reconnect the loose wire",
            description:
              "There is one wire inside the back that is nearly disconnected. Someone pulled it most of the way out. Re-seat it.",
            type: "social",
            damage: 40,
            rewardText:
              "The wire clicks in. The green light holds steady. The radio is ready to speak.",
          },
          {
            id: "radio-final-offer",
            label: "Grand Offering to the Signal",
            description: "Pay the maximum tribute. The radio will respond.",
            type: "offer_boost",
            damage: 50,
            offerCost: 4,
            rewardText: "The signal locks. The broadcast begins.",
          },
        ],
      },
    ],
    defeatText:
      "Signal locked in. Green light blazes.\n\nThe radio broadcasts clearly — one moment of absolute clarity.\n\n*\"The last one to take it... will always be the one to finish it.\"*\n\nA beat of silence.\n\nThe light overloads. White flash.\n\nThe house goes dark.\n\n*\"The house goes dark.\"*",
    victoryAdvantage:
      "Act 3 begins. The house is dark. You are in the dining room. Find a way to see.",
    da: {
      title: "Radioen",
      subtitle: "Gammel bakelit. Grøn skive. Den har forsøgt at fortælle dig noget hele aftenen.",
      description:
        "Den gamle brune bakelit-radio i spisestuen. Den har knatret siden I ankom.",
      atmosphere:
        "Spisestuen, aften. Det lange fyrretræsbord, otte stole, stearinlys. På hylden: radioen. Den grønne skive lyser svagt.",
      defeatText:
        "Signal låst. Grønt lys blusser op.\n\nRadioen sender klart — ét øjeblik af absolut klarhed.\n\n*\"Den sidste der tog det... vil altid være den der afslutter det.\"*\n\nEt slag af stilhed.\n\nLyset overlaster. Hvid flash.\n\nHuset bliver mørkt.\n\n*\"Huset bliver mørkt.\"*",
      victoryAdvantage:
        "Akt 3 begynder. Huset er mørkt. Du er i spisestuen. Find en måde at se på.",
      phases: [
        {
          phase: 1, title: "Statisk", description: "Signalet er næppe der. Start med at gendanne.",
          actions: [
            { id: "radio-antenna", label: "Juster antennen", rewardText: "Antennen finder en position. Signalstyrken stiger. 25 HP genoprettet.", failureText: "Statikken er uændret." },
            { id: "radio-fuse", label: "Udskift sikringen", puzzlePrompt: "Erstatningssikringen er klistret til indersiden af paneldøren. En seddel ved siden af den: \"Ikke første gang. Vil ikke være den sidste. Match vurderingen præcis.\" Hvad gør du?", hint: "Begge sikringer matcher. Svaret er indlysende.", rewardText: "Sikringen er udskiftet. Den grønne skive lyser op. 30 HP genoprettet.", failureText: "Panelet lukker. Statikken fortsætter." },
            { id: "radio-frequency", label: "Stem frekvensen", rewardText: "Skiven låser. Det grønne lys blusser. 35 HP genoprettet.", failureText: "Du har brug for alle tre radiofragmenter først." },
            { id: "radio-offer-boost", label: "Hæld en ud til radioen", rewardText: "Statikken dæmpes. 20 HP genoprettet." },
          ],
        },
        {
          phase: 2, title: "Signal Låst", description: "Signalet er næsten klart.",
          actions: [
            { id: "radio-speaker", label: "Rens højttalergitteret", rewardText: "Gitteret er rent. Radioen er klar.", failureText: "Gitteret modstår." },
            { id: "radio-wire", label: "Genopret det løse kabel", rewardText: "Kablet klikker på plads. Det grønne lys holder stabil." },
            { id: "radio-final-offer", label: "Stoffer til Signalet", rewardText: "Signalet låser. Udsendelsen begynder." },
          ],
        },
      ],
    },
  },

  // ==========================================
  // ACT 3 BOSS — YOURSELVES
  // HP label: "Recognition"
  // 3 phases: Denial → Recognition → Acceptance
  // Defeat = culprit reveal
  // ==========================================
  {
    id: "yourselves",
    chapterId: "act-3",
    title: "YOURSELVES",
    subtitle: "The previous visitors. The ones who left all of this behind.",
    description:
      "The living room. The group is back together. The radio is silent. The stove is cold. Everything you found tonight — the bedroom notes, the date list, the sealed wall, the note in the shed signed with almost-your-names — points here. The boss fight is the house forcing a recognition. You are not fighting a monster. You are fighting your own denial.",
    icon: "👥",
    look: {
      icon: "👥",
      atmosphere:
        "The living room in darkness. The sofa, the shelf of paperbacks, the cold stove. The group stands in a circle. The note from the shed is on the table. The date list photo is on someone's phone. Everything is here. The house has been trying to tell you something all evening. Now it makes you listen.",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
      backgroundStyle: "dark-living-boss",
    },
    maxHp: 150,
    requiredRoomIds: ["shed-dark", "door-nobody-tried"],
    phases: [
      {
        phase: 1,
        title: "Denial",
        description:
          "*\"This can't be us.\"* — Actions establish uncomfortable familiarity. Things the group knows without knowing why.",
        hpThreshold: 100,
        actions: [
          {
            id: "yourselves-finish-sentence",
            label: "Finish the sentence",
            description:
              "The note from the Double Room trails off mid-sentence: *\"I know we said we'd come back and finish what we—\"*\n\nSomeone in the group speaks the ending aloud. Any ending. The house accepts it.",
            type: "social",
            damage: 30,
            rewardText:
              "Someone said it. The house registered it. Recognition creeping in. 30 HP.",
            failureText: "The sentence hangs unfinished. Someone must complete it.",
          },
          {
            id: "yourselves-layout",
            label: "You knew the layout",
            description:
              "Did anyone hesitate before any door tonight? Think back. The dining room, the corridor, the door nobody tried. Did you know where to look, without knowing why you knew?",
            type: "choice",
            damage: 25,
            choices: [
              {
                id: "yes-hesitated",
                label: "Yes — I hesitated",
                description: "You paused before a specific door. You already knew what was behind it.",
                isCorrect: true,
                consequence: "The house notes this. Both answers matter equally. Recognition climbs.",
              },
              {
                id: "no-first-time",
                label: "No — first time here",
                description: "You moved through the house fresh, as if seeing it for the first time.",
                isCorrect: true,
                consequence: "The house notes this too. Both answers register. That's the point.",
              },
            ],
            rewardText: "The house is listening. Your answer — either answer — matters. 25 HP.",
          },
          {
            id: "yourselves-shed-note-recall",
            label: "Describe the shed note without looking at it",
            description:
              "Your team found the shed date list in Act 1. Describe it from memory — what was crossed out, what wasn't, what the last entry said.",
            type: "puzzle",
            damage: 30,
            puzzle: {
              prompt:
                "Describe the shed date list from memory. What was on it? What made it wrong?\n\nAccepted: describe the list of dates, that today's date is uncrossed, that all others are crossed out.",
              answer: [
                "crossed out", "overstreget", "today", "i dag", "uncrossed", "ikke overstreget",
                "july", "juli", "dates", "datoer", "list", "liste",
              ],
            },
            hint: "The list of dates. All crossed out except the last one. The last one is today.",
            rewardText:
              "The group remembers. Without looking at a photo, without checking notes. You just knew. 30 HP.",
            failureText: "The memory is fuzzy. Look at the clue if you need to — but this should be familiar.",
          },
        ],
      },
      {
        phase: 2,
        title: "Recognition",
        description:
          "*\"We've done this before.\"* — Actions force specific acknowledgements. Details only the previous visitors would know.",
        hpThreshold: 60,
        actions: [
          {
            id: "yourselves-handwriting",
            label: "Whose handwriting is in the Double Room?",
            description:
              "The half-finished note in the Double Room. The group must name a player — whoever they think wrote it. The correct answer is the culprit. Any name is accepted. The tension is in the debate.",
            type: "social",
            damage: 35,
            rewardText:
              "A name is named. The house does not confirm or deny. But someone in the group feels it land. 35 HP.",
            failureText: "Someone must be named. The house requires it.",
          },
          {
            id: "yourselves-bunk-reads",
            label: "What did the Bunk Room know?",
            description:
              "The player who completed the bunk room reads the note aloud to the group. All of it. Their scared-silent status ended when the Living Room was cleared in Act 2 — they've been able to speak normally through all of Act 3.",
            type: "social",
            damage: 30,
            rewardText:
              "*\"It was taken. It is always taken. The room where everyone gathers holds the rest.\"* Read aloud. The group hears it with different weight now. 30 HP.",
            failureText: "The bunk room player must read the note aloud.",
          },
          {
            id: "yourselves-stand-where-you-slept",
            label: "Stand where you slept",
            description:
              "Physical challenge. Each player moves to the room they entered in Act 2 — the bedroom they claimed. 30 seconds. Then return.",
            type: "puzzle",
            damage: 25,
            physicalChallenge: {
              timerSeconds: 45,
              startLabel: "Begin — scatter to your rooms",
              activeEmoji: "🛌",
              bannerText: "Everyone is in the room they slept in",
              completeLabel: "Back together — the house noticed",
            },
            puzzle: {
              prompt: "Confirm: did everyone return to their bedroom and come back?",
              answer: ["yes", "ja", "done", "færdig", "complete"],
            },
            rewardText: "The house watched. You moved through it like you'd done it before. 25 HP.",
          },
          {
            id: "yourselves-silence",
            label: "Say nothing for 45 seconds",
            description:
              "Physical challenge. The house waits. Full silence. Phones down. Nobody types. Nobody speaks. 45 seconds.",
            type: "puzzle",
            damage: 30,
            physicalChallenge: {
              timerSeconds: 45,
              startLabel: "Begin silence",
              activeEmoji: "🤫",
              bannerText: "The house is listening",
              completeLabel: "The silence is over",
            },
            puzzle: {
              prompt: "Confirm: did the group hold silence for the full 45 seconds?",
              answer: ["yes", "ja", "done", "færdig"],
            },
            rewardText: "45 seconds of nothing. The house noticed. 30 HP.",
          },
        ],
      },
      {
        phase: 3,
        title: "Acceptance",
        description:
          "*\"We are the ones who didn't finish.\"* — Actions are acts of completion.",
        hpThreshold: 20,
        actions: [
          {
            id: "yourselves-name-taken",
            label: "Name what was taken",
            description:
              "One thing was taken from this house. Not furniture. Not money. The one thing that required the house to keep its books open, to keep the date list running, to never cross tonight off. Name it.",
            type: "puzzle",
            damage: 40,
            puzzle: {
              prompt: "What was taken?\n\n(The radio said it. The note in the Double Room implies it. The game is named after it.)",
              answer: [
                "the last cold beer", "the beer", "last cold beer", "cold beer",
                "øl", "den kolde øl", "den sidste kolde øl", "beer",
              ],
            },
            hint: "The last. Cold. Beer.",
            rewardText:
              "Named. The house closes one ledger. One account remains open. 40 HP.",
            failureText: "The answer is in the name of the game.",
          },
          {
            id: "yourselves-radio-words",
            label: "Say the radio's words together",
            description:
              "The whole group types — or speaks aloud — the broadcast line. All of it. Together.",
            type: "puzzle",
            damage: 40,
            puzzle: {
              prompt:
                "Type the radio's broadcast — the exact words heard when the signal locked in Act 2.\n\n\"The last one to take it... will always be the one to finish it.\"",
              answer: [
                "the last one to take it will always be the one to finish it",
                "the last one to take it... will always be the one to finish it",
                "den sidste der tog det vil altid være den der afslutter det",
              ],
            },
            hint: "The radio said it in Act 2. You heard it before the house went dark.",
            rewardText:
              "The words spoken. All of them, together. The house receives this. 40 HP.",
            failureText: "Say exactly what the radio broadcast. All of it.",
          },
          {
            id: "yourselves-ready",
            label: "We're ready.",
            description:
              "The final action. No puzzle. No answer. One button. The house has made its case. The group has made their acknowledgement. Press it when you mean it.",
            type: "social",
            damage: 50,
            rewardText:
              "The partial light steadies.\n\n*(beat)*\n\n*\"You've been here before.\"*\n\n*(beat)*\n\n*\"All of you.\"*\n\n*(beat)*\n\n*\"Except one of you took something.\"*",
          },
        ],
      },
    ],
    defeatText:
      "The partial light steadies.\n\n*\"You've been here before.\"*\n\n*\"All of you.\"*\n\n*\"Except one of you took something.\"*\n\nThe culprit is revealed.",
    victoryAdvantage:
      "The game ends. The culprit is named. The last cold beer is in their hands.",
    da: {
      title: "JER SELV",
      subtitle: "De tidligere besøgere. Dem der efterlod alt dette.",
      description:
        "Stuen. Gruppen er samlet igen. Radioen er stille. Ovnen er kold. Alt hvad I fandt i aften peger her.",
      atmosphere:
        "Stuen i mørket. Sofaen, hylden med paperbacks, den kolde ovn. Gruppen står i en cirkel.",
      defeatText:
        "Det delvise lys stabiliserer sig.\n\n*\"I har været her før.\"*\n\n*\"Alle jer.\"*\n\n*\"Undtagen én af jer tog noget.\"*\n\nSkylden afsløres.",
      victoryAdvantage: "Spillet slutter. Den skyldige navngives. Den sidste kolde øl er i deres hænder.",
      phases: [
        {
          phase: 1, title: "Fornægtelse", description: "*\"Det kan ikke være os.\"*",
          actions: [
            { id: "yourselves-finish-sentence", label: "Afslut sætningen", rewardText: "Nogen sagde det. Huset registrerede det. 30 HP.", failureText: "Sætningen hænger uafsluttet." },
            { id: "yourselves-layout", label: "Du kendte plantegningen", rewardText: "Huset lytter. Dit svar — begge svar — betyder noget. 25 HP." },
            { id: "yourselves-shed-note-recall", label: "Beskriv skursedlen uden at se på den", hint: "Listen af datoer. Alle overstreget undtagen den sidste. Den sidste er i dag.", rewardText: "Gruppen husker. Uden at kigge på et foto. 30 HP.", failureText: "Hukommelsen er uklar." },
          ],
        },
        {
          phase: 2, title: "Genkendelse", description: "*\"Vi har gjort dette før.\"*",
          actions: [
            { id: "yourselves-handwriting", label: "Hvems håndskrift er i dobbeltværelset?", rewardText: "Et navn er navngivet. 35 HP.", failureText: "Nogen skal navngives." },
            { id: "yourselves-bunk-reads", label: "Hvad vidste køjestuen?", rewardText: "Læst højt. Gruppen hører det med anden vægt nu. 30 HP.", failureText: "Køjestuens spiller skal læse sedlen højt." },
            { id: "yourselves-stand-where-you-slept", label: "Stå hvor du sov", rewardText: "Huset så til. I bevægede jer igennem det som om I havde gjort det før. 25 HP." },
            { id: "yourselves-silence", label: "Sig ingenting i 45 sekunder", rewardText: "45 sekunders ingenting. Huset lagde mærke til det. 30 HP." },
          ],
        },
        {
          phase: 3, title: "Accept", description: "*\"Vi er dem der ikke afsluttede det.\"*",
          actions: [
            { id: "yourselves-name-taken", label: "Navngiv hvad der blev taget", hint: "Den sidste. Kolde. Øl.", rewardText: "Navngivet. 40 HP.", failureText: "Svaret er i spillets navn." },
            { id: "yourselves-radio-words", label: "Sig radioens ord sammen", hint: "Radioen sagde det i Akt 2.", rewardText: "Ordene sagt. Alle af dem, sammen. 40 HP.", failureText: "Sig præcis hvad radioen sendte." },
            { id: "yourselves-ready", label: "Vi er klar.", rewardText: "Det delvise lys stabiliserer sig.\n\n*(slag)*\n\n*\"I har været her før.\"*\n\n*(slag)*\n\n*\"Alle jer.\"*\n\n*(slag)*\n\n*\"Undtagen én af jer tog noget.\"*" },
          ],
        },
      ],
    },
  },
];

export function getBoss(id: string): Boss | undefined {
  return BOSSES.find((b) => b.id === id);
}

export function getBossByChapter(chapterId: string): Boss | undefined {
  return BOSSES.find((b) => b.chapterId === chapterId);
}
