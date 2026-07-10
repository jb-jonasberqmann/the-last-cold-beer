import type { Clue } from "@/types/content";

// ==========================================
// ALL CLUES
// isArtifact = true for the five Act 3 inventory items
// isKeyClue = true for clues required at boss or act transition
// ==========================================
export const CLUES: Clue[] = [

  // ==========================================
  // ACT 1 — CODE FRAGMENTS
  // Four fragments collected across outdoor rooms. Driveway, Terrace, and
  // Garden fragments are per-team (revealedTo splits which variant each
  // team actually receives) so teams can't just compare answers out loud.
  // Shed's fragment is universal since it ties into Act 3 continuity.
  // Combined at The Front Door to enter Act 2.
  // ==========================================
  {
    id: "fragment-driveway-a",
    chapterId: "act-1",
    title: "Code Fragment — Driveway",
    description:
      "The house's arrival scanner counted your team the moment the photo was taken. It says **3**. It could be wrong. It insists it isn't.",
    icon: "🔢",
    flavor: "It might be wrong. It might be right. Who are you to judge — it's only a bot.",
    isKeyClue: true,
    revealedTo: "team-a",
    da: {
      title: "Kodefragment — Indkørslen",
      description: "Husets ankomst-scanner talte jeres hold i det øjeblik billedet blev taget. Den siger **3**. Den kan tage fejl. Den insisterer på at den ikke gør.",
      flavor: "Den kan tage fejl. Den kan have ret. Hvem er du til at dømme — den er bare en bot.",
    },
  },
  {
    id: "fragment-driveway-b",
    chapterId: "act-1",
    title: "Code Fragment — Driveway",
    description:
      "The house's arrival scanner counted your team the moment the photo was taken. It says **6**. It could be wrong. It insists it isn't.",
    icon: "🔢",
    flavor: "It might be wrong. It might be right. Who are you to judge — it's only a bot.",
    isKeyClue: true,
    revealedTo: "team-b",
    da: {
      title: "Kodefragment — Indkørslen",
      description: "Husets ankomst-scanner talte jeres hold i det øjeblik billedet blev taget. Den siger **6**. Den kan tage fejl. Den insisterer på at den ikke gør.",
      flavor: "Den kan tage fejl. Den kan have ret. Hvem er du til at dømme — den er bare en bot.",
    },
  },
  {
    id: "fragment-terrace-a",
    chapterId: "act-1",
    title: "Code Fragment — Terrace",
    description:
      "The missing spine from the shelf through the terrace glass: **5**",
    icon: "🔢",
    flavor: "Someone took that one off the shelf on purpose.",
    isKeyClue: true,
    revealedTo: "team-a",
    da: {
      title: "Kodefragment — Terrassen",
      description: "Den manglende ryg fra hylden gennem terrassens glas: **5**",
      flavor: "Nogen fjernede den fra hylden med vilje.",
    },
  },
  {
    id: "fragment-terrace-b",
    chapterId: "act-1",
    title: "Code Fragment — Terrace",
    description:
      "The missing spine from the shelf through the terrace glass: **2**",
    icon: "🔢",
    flavor: "Someone took that one off the shelf on purpose.",
    isKeyClue: true,
    revealedTo: "team-b",
    da: {
      title: "Kodefragment — Terrassen",
      description: "Den manglende ryg fra hylden gennem terrassens glas: **2**",
      flavor: "Nogen fjernede den fra hylden med vilje.",
    },
  },
  {
    id: "fragment-garden-a",
    chapterId: "act-1",
    title: "Code Fragment — Garden",
    description:
      "The digit carved into the old oak, once you worked out what it was describing: **1**",
    icon: "🔢",
    flavor: "The garden keeps secrets better than anyone — this one just needed reading, not digging.",
    isKeyClue: true,
    revealedTo: "team-a",
    da: {
      title: "Kodefragment — Haven",
      description: "Cifferet ridset ind i den gamle egetræ, når du fandt ud af hvad det beskrev: **1**",
      flavor: "Haven holder hemmeligheder bedre end nogen — denne skulle bare læses, ikke graves frem.",
    },
  },
  {
    id: "fragment-garden-b",
    chapterId: "act-1",
    title: "Code Fragment — Garden",
    description:
      "The digit carved into the old oak, once you worked out what it was describing: **8**",
    icon: "🔢",
    flavor: "The garden keeps secrets better than anyone — this one just needed reading, not digging.",
    isKeyClue: true,
    revealedTo: "team-b",
    da: {
      title: "Kodefragment — Haven",
      description: "Cifferet ridset ind i den gamle egetræ, når du fandt ud af hvad det beskrev: **8**",
      flavor: "Haven holder hemmeligheder bedre end nogen — denne skulle bare læses, ikke graves frem.",
    },
  },
  {
    id: "fragment-shed",
    chapterId: "act-1",
    title: "Code Fragment — Shed",
    description:
      "Every date on the shed's laminated list falls in July — the seventh month, without exception, across sixteen years: **7**",
    icon: "🔢",
    flavor: "Hidden in plain sight, like everything else on that list.",
    isKeyClue: true,
    da: {
      title: "Kodefragment — Skuret",
      description: "Hver eneste dato på skurets laminerede liste falder i juli — den syvende måned, uden undtagelse, gennem seksten år: **7**",
      flavor: "Gemt i åbenlys syne, ligesom alt andet på den liste.",
    },
  },
  {
    id: "mads-unloaded",
    chapterId: "act-1",
    title: "The Way Is Clear",
    description:
      "Mads is finally empty-handed — and no longer blocking the path to the front door. Nothing stands between you and the key box now.",
    icon: "🙌",
    flavor: "He grins like this was the plan all along.",
    isKeyClue: true,
    da: {
      title: "Vejen Er Fri",
      description: "Mads er endelig tomhændet — og blokerer ikke længere vejen til hoveddøren. Intet står mellem jer og nøgleboksen nu.",
      flavor: "Han griner som om det var planen hele tiden.",
    },
  },

  // ==========================================
  // ACT 1 — THE SHED ATMOSPHERE (wrong note)
  // Not a code fragment. The first seed of wrongness.
  // ==========================================
  {
    id: "shed-date-list",
    chapterId: "act-1",
    title: "The Date List",
    description:
      "Pinned to the inside wall of the shed — laminated, with actual push pins — a handwritten list of dates, written as plain numbers, one under another. All crossed out except the last.\n\n~~07192010~~\n~~07112011~~\n~~07232012~~\n~~07152013~~\n~~07142014~~\n~~07202015~~\n~~07182016~~\n~~07102017~~\n~~07162018~~\n~~07222019~~\n~~07132020~~\n~~07192021~~\n~~07112022~~\n~~07172023~~\n~~07152024~~\n~~07212025~~\n\n**{{TODAY}} — not crossed out.**\n\nSixteen years, sixteen dates. If you looked closely, you'd already have found what they share.",
    icon: "📋",
    flavor: "Someone has been keeping track. Every year. They always cross the date out.",
    isKeyClue: false,
    da: {
      title: "Datolisten",
      description: "Fastgjort til indervæggen i skuret — lamineret, med rigtige tegnestifter — en håndskrevet liste af datoer, skrevet som rene tal, én under den anden. Alle overstreget undtagen den sidste.\n\n~~07192010~~\n~~07112011~~\n~~07232012~~\n~~07152013~~\n~~07142014~~\n~~07202015~~\n~~07182016~~\n~~07102017~~\n~~07162018~~\n~~07222019~~\n~~07132020~~\n~~07192021~~\n~~07112022~~\n~~07172023~~\n~~07152024~~\n~~07212025~~\n\n**{{TODAY}} — ikke overstreget.**\n\nSeksten år, seksten datoer. Havde du kigget nøje, havde du allerede fundet det de har til fælles.",
      flavor: "Nogen har holdt styr på det. Hvert år. De overstreger altid datoen.",
    },
  },

  // ==========================================
  // ACT 2 — BEDROOM WORDS (for living room puzzle)
  // Team A gets owed/borrowed/taken, Team B gets promised/broken/buried —
  // revealedTo keeps each team from ever seeing the other's set.
  // ==========================================
  {
    id: "word-owed",
    chapterId: "act-2",
    title: "The Double Room Note",
    description:
      "A note on the bedside table. Mid-sentence. Never finished.\n\n*\"We owed it to each other. We owed it to the house. I know we said we'd come back and finish what we ____.\"*\n\nThe clue word: **owed**",
    icon: "📝",
    flavor: "Warm and human. But carries weight.",
    isKeyClue: true,
    revealedTo: "team-a",
    da: {
      title: "Dobbeltværelsets Seddel",
      description: "En seddel på natbordet. Midt i en sætning. Aldrig afsluttet.\n\n*\"Vi skyldte det hinanden. Vi skyldte det huset. Jeg ved vi sagde vi ville komme tilbage og afslutte hvad vi ____.\"*\n\nNøgleordet: **skyldte**",
      flavor: "Varm og menneskelig. Men bærer vægt.",
    },
  },
  {
    id: "word-promised",
    chapterId: "act-2",
    title: "The Double Room Note",
    description:
      "A note on the bedside table. Mid-sentence. Never finished.\n\n*\"We promised it to each other. We promised it to the house. I know we said we'd come back and finish what we ____.\"*\n\nThe clue word: **promised**",
    icon: "📝",
    flavor: "Warm and human. But carries weight.",
    isKeyClue: true,
    revealedTo: "team-b",
    da: {
      title: "Dobbeltværelsets Seddel",
      description: "En seddel på natbordet. Midt i en sætning. Aldrig afsluttet.\n\n*\"Vi lovede det hinanden. Vi lovede det huset. Jeg ved vi sagde vi ville komme tilbage og afslutte hvad vi ____.\"*\n\nNøgleordet: **lovede**",
      flavor: "Varm og menneskelig. Men bærer vægt.",
    },
  },
  {
    id: "word-borrowed",
    chapterId: "act-2",
    title: "The Single Room Note",
    description:
      "A note found in the single room. It starts as observation. It ends as an existential crisis.\n\n*\"This is not even my house... Borrowed it is... Not even my bed... Borrowed... This... life... borrowed?\"*\n\nThe clue word: **borrowed**",
    icon: "📝",
    flavor: "You can't tell which parts were deliberate.",
    isKeyClue: true,
    revealedTo: "team-a",
    da: {
      title: "Enkeltværelsets Seddel",
      description: "En seddel fundet i enkeltværelset. Den starter som observation. Den ender som eksistentiel krise.\n\n*\"Det er ikke engang mit hus... Lånt er det... Ikke engang min seng... Lånt... Dette... liv... lånt?\"*\n\nNøgleordet: **lånt**",
      flavor: "Du kan ikke se hvilke dele der var bevidste.",
    },
  },
  {
    id: "word-broken",
    chapterId: "act-2",
    title: "The Single Room Note",
    description:
      "A note found in the single room. It starts as observation. It ends as an existential crisis.\n\n*\"This is not even my house... Broken it is... Not even my bed... Broken... This... life... broken?\"*\n\nThe clue word: **broken**",
    icon: "📝",
    flavor: "You can't tell which parts were deliberate.",
    isKeyClue: true,
    revealedTo: "team-b",
    da: {
      title: "Enkeltværelsets Seddel",
      description: "En seddel fundet i enkeltværelset. Den starter som observation. Den ender som eksistentiel krise.\n\n*\"Det er ikke engang mit hus... I stykker er det... Ikke engang min seng... I stykker... Dette... liv... i stykker?\"*\n\nNøgleordet: **i stykker**",
      flavor: "Du kan ikke se hvilke dele der var bevidste.",
    },
  },
  {
    id: "word-taken",
    chapterId: "act-2",
    title: "The Bunk Room Note",
    description:
      "Written on the underside of the top bunk mattress. Two sentences. One word.\n\n*\"It was ______. It is always ______.\"*\n\nOnly the player who entered the bunk room knows the missing word — and they cannot say it or write it. In the living room, they must act it out in silence until the team guesses.",
    icon: "📝",
    flavor: "This person wrote exactly what was needed and nothing more.",
    isKeyClue: true,
    revealedTo: "team-a",
    da: {
      title: "Køjestueens Seddel",
      description: "Skrevet på undersiden af den øverste køje-madras. To sætninger. Ét ord.\n\n*\"Det blev ______. Det bliver altid ______.\"*\n\nKun spilleren der var inde i køjestuen kender det manglende ord — og de må hverken sige det eller skrive det. I stuen skal de fremvise det i tavshed indtil holdet gætter.",
      flavor: "Denne person skrev præcis hvad der var nødvendigt og intet mere.",
    },
  },
  {
    id: "word-buried",
    chapterId: "act-2",
    title: "The Bunk Room Note",
    description:
      "Written on the underside of the top bunk mattress. Two sentences. One word.\n\n*\"It was ______. It is always ______.\"*\n\nOnly the player who entered the bunk room knows the missing word — and they cannot say it or write it. In the living room, they must act it out in silence until the team guesses.",
    icon: "📝",
    flavor: "This person wrote exactly what was needed and nothing more.",
    isKeyClue: true,
    revealedTo: "team-b",
    da: {
      title: "Køjestueens Seddel",
      description: "Skrevet på undersiden af den øverste køje-madras. To sætninger. Ét ord.\n\n*\"Det blev ______. Det bliver altid ______.\"*\n\nKun spilleren der var inde i køjestuen kender det manglende ord — og de må hverken sige det eller skrive det. I stuen skal de fremvise det i tavshed indtil holdet gætter.",
      flavor: "Denne person skrev præcis hvad der var nødvendigt og intet mere.",
    },
  },

  // ==========================================
  // ACT 2 — RADIO FRAGMENTS (atmospheric)
  // One per room, building to the dining room revelation
  // ==========================================
  {
    id: "radio-fragment-toilet",
    chapterId: "act-2",
    title: "Radio Fragment — The Toilet",
    description:
      "Through the crackling static, a fragment: *\"...the last one...\"*\n\nThen nothing. Of all the places to hear it.",
    icon: "📻",
    flavor: "The radio in the dining room is audible even in here. Somehow.",
    isKeyClue: false,
  },
  {
    id: "radio-fragment-kitchen",
    chapterId: "act-2",
    title: "Radio Fragment — Kitchen",
    description:
      "A burst of clearer static: *\"...will always be...\"*\n\nThen white noise.",
    icon: "📻",
    flavor: "Still from the dining room. Getting closer to something.",
    isKeyClue: false,
  },
  {
    id: "radio-fragment-activity",
    chapterId: "act-2",
    title: "Radio Fragment — Activity Room",
    description:
      "One clear phrase before the static swallows it: *\"...the one to finish it.\"*",
    icon: "📻",
    flavor: "Three fragments. One message. You need to fix the radio.",
    isKeyClue: false,
  },

  // ==========================================
  // ACT 2 — SUNROOM
  // Not a code fragment or key clue — a mechanical marker used to auto-apply
  // a bonus hit on the Radio boss for whichever player went sun-blind.
  // ==========================================
  {
    id: "sunroom-blind-mark",
    chapterId: "act-2",
    title: "What the Glare Left Behind",
    description:
      "Someone on your team stared straight into the low sun through the sunroom glass and didn't look away. They can't see straight anymore — not until the house goes properly dark. But they know exactly what it feels like to lose a sense to something in this house. That'll matter at the radio.",
    icon: "🌇",
    flavor: "Losing one sense early makes the next one easier to face.",
    isKeyClue: false,
    da: {
      title: "Hvad Blændingen Efterlod",
      description: "Nogen på jeres hold stirrede lige ind i den lave sol gennem vinterhavens glas og kiggede ikke væk. De kan ikke se ordentligt længere — ikke før huset bliver rigtig mørkt. Men de ved præcis hvordan det føles at miste en sans til noget i dette hus. Det kommer til at betyde noget ved radioen.",
      flavor: "At miste én sans tidligt gør den næste lettere at møde.",
    },
  },

  // ==========================================
  // ACT 3 — ARTIFACTS
  // Five inventory items. isArtifact: true.
  // Collected by completing rooms. Required to unlock subsequent rooms.
  // ==========================================
  {
    id: "artifact-flashlight",
    chapterId: "act-3",
    title: "The Flashlight",
    description:
      "A handheld torch from the utility corner. Works. The batteries are warm — someone used this recently.",
    icon: "🔦",
    flavor: "The darkness becomes navigable. Just.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Lommelygten",
      description: "En håndholdt lommelygte fra redskabshjørnet. Virker. Batterierne er varme — nogen brugte den for nylig.",
      flavor: "Mørket bliver overkommeligt. Næsten.",
    },
  },
  {
    id: "artifact-fuse",
    chapterId: "act-3",
    title: "The Fuse",
    description:
      "A glass-tube fuse from the fuse box. Burnt out — but you know what to swap it with. Restores partial power to one circuit.",
    icon: "⚡",
    flavor: "One light. That's enough.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Sikringen",
      description: "En glasrørssikring fra sikringsskabet. Brændt ud — men du ved hvad du skal bytte den med. Genopretter delvis strøm til ét kredsløb.",
      flavor: "Ét lys. Det er nok.",
    },
  },
  {
    id: "artifact-wrench",
    chapterId: "act-3",
    title: "The Wrench",
    description:
      "Found in the kitchen drawer once the power came back. The handle is worn — this wrench has done a lot of work in this house.",
    icon: "🔧",
    flavor: "The right tool. Finally.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Skruenøglen",
      description: "Fundet i køkkenskuffen da strømmen kom tilbage. Håndtaget er slidt — denne skruenøgle har lavet meget arbejde i dette hus.",
      flavor: "Det rigtige værktøj. Endelig.",
    },
  },
  {
    id: "artifact-candle",
    chapterId: "act-3",
    title: "The Candle",
    description:
      "A half-burned taper candle from the conservatory, with a box of matches. The wax is a deep red. Someone brought this specifically.",
    icon: "🕯️",
    flavor: "The flame makes the walls look different.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Lysestagen",
      description: "Et halvt brændt stearinlys fra vinterhaven, med en tændstikæske. Voksen er dyb rød. Nogen bragte dette specifikt.",
      flavor: "Flammen får væggene til at se anderledes ud.",
    },
  },
  {
    id: "artifact-final-note",
    chapterId: "act-3",
    title: "The Note from the Shed",
    description:
      "Found inside the shed, on the floor under the date list. A handwritten note — signed with names that are almost, but not quite, your names.\n\n*\"We came. We stayed. We failed... This time.. Finish it... Every last drop.\"*",
    icon: "📄",
    flavor: "The handwriting is familiar in a way you cannot explain.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Sedlen fra Skuret",
      description: "Fundet inde i skuret, på gulvet under datolisten. En håndskrevet seddel — underskrevet med navne der er næsten, men ikke helt, jeres navne.\n\n*\"Vi kom. Vi blev. Vi fejlede... Denne gang.. Afslut det... Til allersidste dråbe.\"*",
      flavor: "Håndskriften er bekendt på en måde du ikke kan forklare.",
    },
  },

  // ==========================================
  // ACT 3 — THE METER CUPBOARD
  // Not a key clue — atmospheric marker for the deliberate power cut
  // ==========================================
  {
    id: "meter-cupboard-cut",
    chapterId: "act-3",
    title: "The Main Switch, Thrown",
    description:
      "The house's main power switch, outside near the door nobody tried. Thrown, not tripped — and wet mud smeared across the handle. Fresh. Whatever the fuse box fixed, this undoes.",
    icon: "🔌",
    flavor: "Someone was out here in the last few minutes. Time to find a candle.",
    isKeyClue: false,
  },

  // ==========================================
  // ACT 3 — THE SEALED WALL
  // Revealed by candle. Three lines written at different times.
  // ==========================================
  {
    id: "sealed-wall-writing",
    chapterId: "act-3",
    title: "The Writing on the Sealed Wall",
    description:
      "The candle held close to the sealed wall surface reveals writing — faint but deliberate. Three lines, written at different times, in different hands.\n\n*July 19th 2010*\n\n*\"We locked it so we'd have to come back.\"*\n\n*\"If you found this, you already know. You just haven't admitted it yet.\"*",
    icon: "🕯️",
    flavor: "The oldest date. The first visit. They sealed themselves out.",
    isKeyClue: true,
    da: {
      title: "Teksten på Den Forseglet Væg",
      description: "Lyset holdt tæt til den forseglede vægflade afslører skrift — svag men bevidst. Tre linjer, skrevet på forskellige tidspunkter, i forskellige hænder.\n\n*19. juli 2010*\n\n*\"Vi låste det så vi måtte komme tilbage.\"*\n\n*\"Hvis du fandt dette, ved du allerede. Du har bare ikke indrømmet det endnu.\"*",
      flavor: "Den ældste dato. Det første besøg. De forseglede sig selv ude.",
    },
  },
];

export function getClue(id: string): Clue | undefined {
  return CLUES.find((c) => c.id === id);
}

export function getCluesByChapter(chapterId: string): Clue[] {
  return CLUES.filter((c) => c.chapterId === chapterId);
}

export function getArtifacts(): Clue[] {
  return CLUES.filter((c) => c.isArtifact === true);
}
